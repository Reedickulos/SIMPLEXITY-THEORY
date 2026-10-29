# Test 54: J involution and Gram discrepancy

Date: 2026-10-28. Executed on an independently reconstructed eight-dimensional 240-root E8 set. The spectral pairing was recovered numerically; integer Gram and permutation checks were exact. This is not yet an index-matched rerun of the prior cycle-0 certificate.

Results: 120 inner and 120 outer roots, 120 unique partners; J squared is identity; every partner Gram entry is zero. The maximum forward pairing residual was 2.74e-15. J is NOT a Gram automorphism: among 57,600 entries, 46,080 are unchanged, 5,760 change by -1, and 5,760 by +1. Cross-block Gram discrepancies vanish; inner and outer block discrepancies are negatives. Joint K,H per-row counts match Test 52: (-2,0):1; (-1,0):20; (-1,1):12; (0,-1):12; (0,0):30; (0,1):12; (1,-1):12; (1,0):20; (2,0):1.

The order-30 Coxeter element and its order-three power commute with J; eight simple reflections preserve the integer Gram table but each have 180 commutation disagreements with J. This does not establish a triality correspondence.

Reproducibility: local 54_exact_J_diagnostic.py and 54_results.json. Gram SHA256 cd9ac7a153e6fc00fd80f12258b1a6f7b2b5d75b81398b2c487f31c52b884432. J SHA256 e8c4f6e6c56bb8db39c9af2ff1e8b571109ad239cd40480220ddfc789353990a. The full source and data are not yet in this commit. Next test: exact projector reconstruction and pairing index reconciliation.