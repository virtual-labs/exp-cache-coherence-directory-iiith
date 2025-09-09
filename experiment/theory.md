## Theory

### Introduction to Directory-Based Cache Coherence

In large-scale multiprocessor systems, maintaining cache coherence becomes increasingly challenging as the number of processors grows. Traditional bus-based protocols like MSI don't scale well beyond 16-32 processors due to bandwidth limitations and bus arbitration overhead. **Directory-based cache coherence** protocols solve this scalability problem by maintaining coherence information in a distributed manner.

### The Scalability Problem

#### Bus-Based Limitations
- **Bus contention**: All processors compete for a shared bus
- **Broadcast overhead**: Every cache miss generates broadcasts to all processors
- **Bandwidth bottleneck**: Bus bandwidth doesn't scale with processor count
- **Electrical limitations**: Physical bus length limits the number of processors

#### Directory-Based Solution
Directory-based protocols maintain **coherence state information** for each memory block in a centralized or distributed directory. Instead of broadcasting to all processors, requests are sent only to processors that actually cache the data.

### Directory Structure

#### Basic Directory Entry
Each memory block has an associated directory entry containing:

```
Directory Entry = {
    State: [Uncached | Shared | Exclusive]
    Sharer Vector: [Bit vector indicating which processors have copies]
    Owner: [Processor ID for exclusive blocks]
}
```

#### Directory States

1. **Uncached (U)**
   - No processor currently caches this memory block
   - Memory holds the valid data
   - No coherence actions needed

2. **Shared (S)**
   - One or more processors have read-only copies
   - Memory holds the valid data
   - Sharer vector indicates which processors have copies

3. **Exclusive (E)**
   - Exactly one processor has the block and may have modified it
   - That processor (owner) holds the most recent data
   - Memory may be stale

### Processor Cache States

Similar to MSI protocol but with additional semantics:

1. **Invalid (I)**
   - Cache line is not present or invalid
   - Any access requires directory lookup

2. **Shared (S)**
   - Cache line is valid and unmodified
   - Other processors may also have shared copies
   - Memory is up-to-date

3. **Modified (M)**
   - Cache line is valid and potentially modified
   - This processor is the exclusive owner
   - Memory may be stale; this processor must supply data on requests

### Directory-Based Protocol Operations

#### Read Miss Handling

When processor P wants to read block X:

1. **Check Local Cache**: If cache hit, return data
2. **Directory Lookup**: Send read request to directory
3. **Directory Actions**:
   - **If Uncached**: Send data from memory, set state to Shared, set P's bit in sharer vector
   - **If Shared**: Send data from memory, add P to sharer vector
   - **If Exclusive**: Contact owner processor, request data forwarding, change to Shared

#### Write Miss Handling

When processor P wants to write block X:

1. **Check Local Cache**: If cache hit and exclusive, write directly
2. **Directory Lookup**: Send write request to directory
3. **Directory Actions**:
   - **If Uncached**: Send data from memory, set state to Exclusive, set owner to P
   - **If Shared**: Send invalidations to all sharers, send data to P, set state to Exclusive
   - **If Exclusive**: Contact current owner, request data forwarding and invalidation, set new owner to P

### Message Types

#### Processor to Directory
- **Read-Request**: Request data for reading
- **Write-Request**: Request exclusive access for writing

#### Directory to Processor
- **Data-Reply**: Send requested data
- **Invalidate**: Invalidate cached copy
- **Forward-Request**: Forward request to current owner

#### Processor to Processor
- **Data-Forward**: Owner sends data directly to requestor
- **Writeback**: Send modified data back to directory/memory

### Protocol Example: Read-Shared Scenario

```
Initial State:
- Memory Block A: Directory = [Uncached, 0000, None]
- P1 Cache: Block A = Invalid
- P2 Cache: Block A = Invalid

Step 1: P1 reads Block A
- P1 → Directory: Read-Request(A)
- Directory → P1: Data-Reply(A, data)
- Directory State: [Shared, 0001, None] (P1 bit set)
- P1 Cache: Block A = Shared

Step 2: P2 reads Block A
- P2 → Directory: Read-Request(A)
- Directory → P2: Data-Reply(A, data)
- Directory State: [Shared, 0011, None] (P1, P2 bits set)
- P2 Cache: Block A = Shared
```

### Performance Characteristics

#### Advantages
- **Scalability**: No broadcast bottleneck; point-to-point communication
- **Flexibility**: Works with various network topologies
- **Reduced Traffic**: Only interested processors receive messages
- **Memory Bandwidth**: Better utilization of memory system bandwidth

#### Challenges
- **Directory Overhead**: Storage overhead for directory information
- **Indirection**: Extra directory lookup adds latency
- **Hot Spots**: Directory can become a bottleneck for popular data
- **Complexity**: More complex than bus-based protocols

### Directory Organization Strategies

#### Centralized Directory
- Single directory node manages all memory blocks
- Simple implementation but potential bottleneck
- Used in smaller systems (8-64 processors)

#### Distributed Directory
- Directory information distributed across memory modules
- Better scalability but more complex routing
- Each node manages directory for its local memory

#### Hierarchical Directory
- Multiple levels of directories
- Reduces directory traffic for local clusters
- Complex implementation but excellent scalability

### Comparison with Bus-Based Protocols

| Aspect | Bus-Based (MSI) | Directory-Based |
|--------|----------------|----------------|
| Scalability | Limited (16-32 CPUs) | High (100s-1000s CPUs) |
| Latency | Low (direct broadcast) | Higher (directory lookup) |
| Bandwidth | Bus bottleneck | Point-to-point efficiency |
| Implementation | Simpler | More complex |
| Storage Overhead | Minimal | Directory storage required |

### Real-World Applications

#### Commercial Systems
- **SGI Origin**: Distributed directory in NUMA systems
- **AMD Opteron**: HyperTransport with directory coherence
- **Intel Xeon**: Directory-based coherence in multi-socket systems

#### Research Systems
- **Stanford DASH**: Early distributed directory system
- **MIT Alewife**: Cache-only memory architecture
- **Wisconsin Typhoon**: Scalable directory protocols

### Design Considerations

#### Sharer Vector Size
- **Full Bit Vector**: One bit per processor (exact but expensive)
- **Coarse Vector**: Grouped processors (efficient but less precise)
- **Limited Pointers**: Store only N processor IDs (hybrid approach)

#### Directory Placement
- **Memory-based**: Directory co-located with memory controllers
- **Cache-based**: Directory integrated with processor caches
- **Network-based**: Directory nodes in interconnection network

### Protocol Optimizations

#### Performance Enhancements
- **Intervention**: Direct cache-to-cache transfers
- **Forwarding**: Reduce directory involvement in common cases
- **Prediction**: Anticipate sharing patterns to reduce latency

#### Storage Optimizations
- **Sparse Directories**: Only track actively shared blocks
- **Compressed Sharing**: Encode common sharing patterns efficiently
- **Hierarchical Encoding**: Multi-level sharing representation

The directory-based approach represents a fundamental shift from broadcast-based coherence to point-to-point communication, enabling the construction of large-scale multiprocessor systems that can scale to hundreds or thousands of processors while maintaining cache coherence efficiently.