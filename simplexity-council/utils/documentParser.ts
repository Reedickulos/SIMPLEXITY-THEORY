import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';
import mammoth from 'mammoth/mammoth.browser.js';
import Tesseract from 'tesseract.js';

// Configure the worker for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.7.284/build/pdf.worker.mjs`;

export const parseDocument = async (file: File): Promise<string> => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  try {
    if (['png', 'jpg', 'jpeg'].includes(extension || '')) {
      const result = await Tesseract.recognize(file, 'eng');
      return result.data.text;
    }

    if (extension === 'pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((item: any) => item.str);
        text += strings.join(' ') + '\n';
      }
      return text;
    } 
    
    if (extension === 'docx') {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }

    if (extension === 'gdoc') {
      throw new Error('Google Docs (.gdoc) files are just web links. Please open your Google Doc, go to File > Download > PDF or Word (.docx), and upload that instead.');
    }

    if (extension === 'ipynb') {
      const text = await file.text();
      try {
        const notebook = JSON.parse(text);
        let parsedText = ``;
        if (notebook.metadata?.kernelspec?.language) {
          parsedText += `[Notebook Language: ${notebook.metadata.kernelspec.language}]\n\n`;
        }
        
        for (const [index, cell] of (notebook.cells || []).entries()) {
          if (cell.cell_type === 'markdown' || cell.cell_type === 'code') {
            const source = Array.isArray(cell.source) ? cell.source.join('') : (cell.source || '');
            parsedText += `--- ${cell.cell_type.toUpperCase()} CELL ${index + 1} ---\n`;
            parsedText += source + '\n\n';
          }
        }
        return parsedText.trim();
      } catch (e: any) {
        if (text.trim().startsWith('<') || text.toLowerCase().includes('<!doctype html>')) {
           const strippedText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
           return `[Note: This file appears to be saved as an HTML webpage. Extracting readable text...]\n\n${strippedText.slice(0, 150000)}`;
        }
        // Fallback parsing strategy
        return `[Warning: File could not be parsed structurally as a Jupyter Notebook, returning raw text preview]\n\n${text.slice(0, 150000)}`;
      }
    }
    
    // For txt, md, csv, py, and other text-based files
    if (['txt', 'md', 'csv', 'json', 'log', 'rtf', 'py'].includes(extension || '')) {
      return await file.text();
    }
    
    throw new Error(`Unsupported file type: ${extension}`);
  } catch (error: any) {
    console.error('Error parsing document:', error);
    throw new Error(`Failed to read document: ${error.message}`);
  }
};
