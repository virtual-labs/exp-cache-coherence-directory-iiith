## References

### Foundational Papers

1. **Censier, L. M., & Feautrier, P. (1978)**  
   "A new solution to coherence problems in multicache systems"  
   *IEEE Transactions on Computers*, 27(12), 1112-1118  
   [DOI: 10.1109/TC.1978.1675013](https://doi.org/10.1109/TC.1978.1675013)  
   *The seminal paper introducing directory-based cache coherence concepts*

2. **Chaiken, D., Kubiatowicz, J., & Agarwal, A. (1991)**  
   "LimitLESS directories: A scalable cache coherence scheme"  
   *Proceedings of the 4th International Conference on Architectural Support for Programming Languages and Operating Systems (ASPLOS)*  
   [DOI: 10.1145/106972.106980](https://doi.org/10.1145/106972.106980)  
   *Introduces scalable directory organizations for large-scale systems*

3. **Lenoski, D., Laudon, J., Gharachorloo, K., Weber, W. D., Gupta, A., Hennessy, J., ... & Wolf, T. (1992)**  
   "The Stanford Dash multiprocessor"  
   *Computer*, 25(3), 63-79  
   [DOI: 10.1109/2.121510](https://doi.org/10.1109/2.121510)  
   *Landmark implementation of distributed directory-based coherence*

### Textbooks

4. **Hennessy, J. L., & Patterson, D. A. (2019)**  
   *Computer Architecture: A Quantitative Approach* (6th Edition)  
   Morgan Kaufmann Publishers  
   ISBN: 978-0128119051  
   *Chapter 5: Thread-Level Parallelism - Comprehensive coverage of cache coherence protocols*

5. **Culler, D. E., Singh, J. P., & Gupta, A. (1999)**  
   *Parallel Computer Architecture: A Hardware/Software Approach*  
   Morgan Kaufmann Publishers  
   ISBN: 978-1558603431  
   *Chapters 8-9: Detailed analysis of directory-based coherence mechanisms*

6. **Sorin, D. J., Hill, M. D., & Wood, D. A. (2011)**  
   *A Primer on Memory Consistency and Cache Coherence*  
   Morgan & Claypool Publishers  
   ISBN: 978-1608455645  
   *Comprehensive reference on cache coherence protocols and memory consistency*

### Architecture and Implementation Studies

7. **Laudon, J., & Lenoski, D. (1997)**  
   "The SGI Origin: A ccNUMA highly scalable server"  
   *Proceedings of the 24th Annual International Symposium on Computer Architecture (ISCA)*  
   [DOI: 10.1145/264107.264206](https://doi.org/10.1145/264107.264206)  
   *Commercial implementation of directory-based coherence in SGI Origin systems*

8. **Kaxiras, S., & Goodman, J. R. (2001)**  
   "Improving CC-NUMA performance using instruction-based prediction"  
   *Proceedings of the 7th International Symposium on High-Performance Computer Architecture (HPCA)*  
   [DOI: 10.1109/HPCA.2001.903256](https://doi.org/10.1109/HPCA.2001.903256)  
   *Performance optimizations for directory-based systems*

### Scalability and Performance Analysis

9. **Marty, M. R., & Hill, M. D. (2008)**  
   "Coherence ordering for ring-based chip multiprocessors"  
   *Proceedings of the 41st Annual IEEE/ACM International Symposium on Microarchitecture (MICRO)*  
   [DOI: 10.1109/MICRO.2008.4771781](https://doi.org/10.1109/MICRO.2008.4771781)  
   *Modern directory coherence for chip multiprocessors*

10. **Ros, A., & Kaxiras, S. (2012)**  
    "Complexity-effective multicore coherence"  
    *Proceedings of the 21st International Conference on Parallel Architectures and Compilation Techniques (PACT)*  
    [DOI: 10.1145/2370816.2370856](https://doi.org/10.1145/2370816.2370856)  
    *Analysis of directory overhead and optimization techniques*

### Survey and Tutorial Papers

11. **Handy, J. (1998)**  
    *The Cache Memory Book* (2nd Edition)  
    Academic Press  
    ISBN: 978-0123229809  
    *Comprehensive coverage of cache design including coherence protocols*

12. **Stenström, P. (1990)**  
    "A survey of cache coherence schemes for multiprocessors"  
    *Computer*, 23(6), 12-24  
    [DOI: 10.1109/2.55497](https://doi.org/10.1109/2.55497)  
    *Classic survey comparing different coherence approaches*

### Memory Consistency and Ordering

13. **Adve, S. V., & Gharachorloo, K. (1996)**  
    "Shared memory consistency models: A tutorial"  
    *Computer*, 29(12), 66-76  
    [DOI: 10.1109/2.546611](https://doi.org/10.1109/2.546611)  
    *Essential background on memory consistency models*

14. **Gharachorloo, K., Lenoski, D., Laudon, J., Gibbons, P., Gupta, A., & Hennessy, J. (1990)**  
    "Memory consistency and event ordering in scalable shared-memory multiprocessors"  
    *Proceedings of the 17th Annual International Symposium on Computer Architecture (ISCA)*  
    [DOI: 10.1145/325164.325102](https://doi.org/10.1145/325164.325102)  
    *Fundamental work on consistency models for directory-based systems*

### Modern Developments

15. **Martin, M. M., Sorin, D. J., Beckmann, B. M., Marty, M. R., Xu, M., Alameldeen, A. R., ... & Wood, D. A. (2005)**  
    "Multifacet's general execution-driven multiprocessor simulator (GEMS) toolset"  
    *ACM SIGARCH Computer Architecture News*, 33(4), 92-99  
    [DOI: 10.1145/1105734.1105747](https://doi.org/10.1145/1105734.1105747)  
    *Simulation tools for evaluating directory-based coherence protocols*

16. **Power, J., Hestness, J., Orr, M. S., Hill, M. D., & Wood, D. A. (2014)**  
    "gem5: A multiple-ISA full system simulator with detailed memory model"  
    *IEEE Computer Architecture Letters*, 13(2), 89-92  
    [DOI: 10.1109/LCA.2014.2329298](https://doi.org/10.1109/LCA.2014.2329298)  
    *Modern simulation framework for cache coherence research*

### Industry Standards and Specifications

17. **AMD Inc. (2007)**  
    "AMD64 Architecture Programmer's Manual Volume 2: System Programming"  
    Publication No. 24593  
    *Chapter 7: Cache coherence implementation in AMD processors*

18. **Intel Corporation (2019)**  
    "Intel 64 and IA-32 Architectures Software Developer's Manual Volume 3A: System Programming Guide"  
    Order Number: 253668  
    *Chapter 11: Memory cache control and cache coherence protocols*

### Online Resources

19. **Computer Architecture Course Materials**  
    Stanford University CS149: Parallel Computing  
    [https://cs149.stanford.edu](https://cs149.stanford.edu)  
    *Lecture notes and assignments on parallel computer architecture*

20. **Wisconsin Multifacet Project**  
    University of Wisconsin-Madison  
    [http://www.cs.wisc.edu/multifacet/](http://www.cs.wisc.edu/multifacet/)  
    *Research group focused on memory system design and cache coherence*

---

### Additional Study Materials

- **ACM Digital Library**: Search for "directory cache coherence" for latest research papers
- **IEEE Xplore**: Computer architecture conference proceedings (ISCA, MICRO, HPCA)
- **Synthesis Lectures on Computer Architecture**: Morgan & Claypool Publishers
- **Computer Architecture Conferences**: ISCA, MICRO, HPCA, ASPLOS annual proceedings