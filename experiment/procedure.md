Follow these step-by-step instructions to understand and explore Directory-Based Cache Coherence using the interactive simulator.

### Step 1: Understanding the Interface

1. **Observe the Initial State**

   - Notice that all processor caches start in the **Invalid (I)** state
   - The directory shows all memory blocks in **Uncached (U)** state
   - All sharer vectors are empty (0000)
   - The message log and performance counters are initialized

2. **Familiarize with the Components**
   - **Processor Caches**: Four processor cache states displayed with color coding
   - **Directory Table**: Central directory showing state, sharer vector, and owner for each memory block
   - **Network Visualization**: Message flow between processors and directory
   - **Control Panel**: Interface to select processor, operation, and memory address
   - **Performance Metrics**: Counters for cache hits, misses, directory lookups, and network messages

### Step 2: Single Processor Read Operation

1. **First Read Access**

   - Select **Processor 0** from the dropdown
   - Choose **Read** operation
   - Select memory address **Block A**
   - Click **"Execute Operation"**

2. **Observe the Protocol Flow**

   - **Step 1**: P0 cache miss → Read-Request sent to Directory
   - **Step 2**: Directory (Uncached state) → Data-Reply sent to P0 with data from memory
   - **Step 3**: Directory updates: State = Shared, Sharer Vector = [1000], P0 cache = Shared
   - **Performance**: Note cache miss and directory lookup recorded

3. **Verify Final State**
   - P0 cache: Block A = **Shared**
   - Directory: Block A = **[Shared, 1000, None]**
   - Message count: 2 (Read-Request + Data-Reply)

### Step 3: Multiple Reader Sharing

1. **Second Reader Access**

   - Select **Processor 1**
   - Choose **Read** operation
   - Select memory address **Block A** (same as Step 2)
   - Click **"Execute Operation"**

2. **Analyze Sharing Behavior**

   - **Step 1**: P1 cache miss → Read-Request sent to Directory
   - **Step 2**: Directory (Shared state) → Data-Reply sent to P1 with data from memory
   - **Step 3**: Directory updates: Sharer Vector = [1100] (both P0 and P1)
   - **Result**: Both processors now share the same data block

3. **Add More Readers**
   - Repeat with **Processor 2** reading **Block A**
   - Observe sharer vector becomes [1110]
   - Notice that memory always provides data for shared reads

### Step 4: Write Operations and Invalidations

1. **Write to Shared Data**

   - Select **Processor 1**
   - Choose **Write** operation
   - Select **Block A** (currently shared by P0, P1, P2)
   - Enter data value "0xFF"
   - Click **"Execute Operation"**

2. **Observe Invalidation Protocol**

   - **Step 1**: P1 cache miss → Write-Request sent to Directory
   - **Step 2**: Directory sends **Invalidate** messages to P0 and P2
   - **Step 3**: P0 and P2 acknowledge invalidations, cache lines become Invalid
   - **Step 4**: Directory sends **Data-Reply** to P1
   - **Step 5**: P1 cache = Modified, Directory = [Exclusive, 0100, P1]

3. **Verify Exclusive Access**
   - P1 cache: Block A = **Modified** (exclusive access)
   - P0, P2 caches: Block A = **Invalid**
   - Directory: Block A = **[Exclusive, 0100, P1]**

### Step 5: Owner-Based Data Forwarding

1. **Read from Modified Data**

   - Select **Processor 3**
   - Choose **Read** operation
   - Select **Block A** (currently owned by P1)
   - Click **"Execute Operation"**

2. **Observe Cache-to-Cache Transfer**

   - **Step 1**: P3 cache miss → Read-Request sent to Directory
   - **Step 2**: Directory identifies P1 as owner → Forward-Request sent to P1
   - **Step 3**: P1 sends **Data-Forward** directly to P3 AND **Writeback** to Directory
   - **Step 4**: P1 downgrades to Shared, P3 gets Shared copy
   - **Step 5**: Directory updates: [Shared, 0110, None]

3. **Performance Benefits**
   - Notice **direct cache-to-cache transfer** (P1 → P3)
   - Lower latency compared to memory access
   - Automatic writeback ensures memory consistency

### Step 6: Performance Analysis

1. **Compare Access Patterns**

   - Try different sequences: all reads vs. mixed read/write
   - Observe message counts for different scenarios
   - Note cache hit rates after establishing sharing

2. **Network Traffic Analysis**

   - **Read-only sharing**: Minimal ongoing traffic
   - **Producer-consumer**: Frequent ownership transfers
   - **Hot data**: High directory lookup activity

3. **Scalability Observations**
   - Count messages for N readers vs. bus-based broadcast (N messages)
   - Notice point-to-point communication vs. broadcast storms
   - Observe directory as potential bottleneck for popular blocks

### Step 7: Advanced Scenarios

1. **Ownership Transfer Chain**

   - P0 writes to Block B → P0 becomes owner
   - P1 writes to Block B → Ownership transfers P0→P1
   - P2 writes to Block B → Ownership transfers P1→P2
   - Observe the forwarding chain and performance impact

2. **Multiple Block Sharing**

   - Access different memory blocks (A, B, C, D) from different processors
   - Observe independent directory entries
   - Compare with shared blocks for traffic patterns

3. **Cache Replacement Simulation**
   - Use the "Invalidate Cache Line" feature to simulate cache evictions
   - Observe directory updates when shared copies are dropped
   - Note the difference between voluntary and involuntary invalidations

### Step 8: Protocol Comparison

1. **Directory vs. Bus-Based Analysis**

   - Simulate the same access pattern in both protocols (if available)
   - Compare total message counts
   - Analyze scalability implications

2. **Bottleneck Identification**
   - Identify scenarios where directory becomes a hotspot
   - Observe network link utilization patterns
   - Consider the impact of directory placement strategies

### Expected Learning Outcomes

After completing this procedure, you should understand:

1. **Protocol Mechanics**: How directory-based coherence maintains consistency without broadcasts
2. **Message Flow**: The specific message types and their purposes in maintaining coherence
3. **Performance Trade-offs**: When directory-based protocols excel vs. their limitations
4. **Scalability Benefits**: Why this approach enables large-scale multiprocessor systems
5. **Implementation Challenges**: Directory storage overhead and potential bottlenecks

### Troubleshooting Tips

- **Unexpected State**: Reset the simulation and carefully follow the step sequence
- **Message Count Confusion**: Use the detailed log to trace each protocol step
- **Performance Anomalies**: Consider cache locality and sharing patterns in your analysis
- **Directory Bottleneck**: Try accessing different memory blocks to distribute directory load

### Extension Activities

1. **Design Challenge**: Propose optimizations for common sharing patterns you observe
2. **Scalability Analysis**: Calculate directory storage requirements for different system sizes
3. **Network Design**: Consider how directory placement affects message latency and throughput
