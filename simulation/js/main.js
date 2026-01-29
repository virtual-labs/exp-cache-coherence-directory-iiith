// Directory-Based Cache Coherence Protocol Simulator

class DirectoryCoherenceSimulator {
    constructor() {
        this.processors = 4;
        this.memoryBlocks = ['A', 'B', 'C', 'D'];
        this.messageCounter = 0;
        
        // Initialize system state
        this.initializeState();
        this.setupEventListeners();
        this.renderInterface();
        this.updateDisplay();
    }

    initializeState() {
        // Cache states: 'I' (Invalid), 'S' (Shared), 'M' (Modified)
        this.cacheStates = {};
        for (let p = 0; p < this.processors; p++) {
            this.cacheStates[p] = {};
            for (let block of this.memoryBlocks) {
                this.cacheStates[p][block] = {
                    state: 'I',
                    data: null
                };
            }
        }

        // Directory states: 'U' (Uncached), 'S' (Shared), 'E' (Exclusive)
        this.directoryStates = {};
        for (let block of this.memoryBlocks) {
            this.directoryStates[block] = {
                state: 'U',
                sharers: new Set(),
                owner: null
            };
        }

        // Performance metrics
        this.metrics = {
            totalOperations: 0,
            cacheHits: 0,
            cacheMisses: 0,
            directoryLookups: 0,
            networkMessages: 0,
            invalidations: 0,
            cacheToCache: 0
        };

        // Message log
        this.messageLog = [];
        
        // Current operation state for step-through mode
        this.currentOperation = null;
        this.operationSteps = [];
        this.currentStep = 0;
        this.autoStepping = false;
        this.stepSpeed = 1500;
    }

    setupEventListeners() {
        document.getElementById('executeBtn').addEventListener('click', () => {
            this.executeOperation();
        });

        document.getElementById('stepBtn').addEventListener('click', () => {
            this.stepThroughOperation();
        });

        document.getElementById('autoStepBtn').addEventListener('click', () => {
            this.toggleAutoStep();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetSimulation();
        });

        document.getElementById('clearLogBtn').addEventListener('click', () => {
            this.clearLog();
        });

        // Step speed control
        const stepSpeedSlider = document.getElementById('stepSpeed');
        const stepSpeedValue = document.getElementById('stepSpeedValue');
        
        stepSpeedSlider.addEventListener('input', (e) => {
            this.stepSpeed = parseInt(e.target.value);
            stepSpeedValue.textContent = (this.stepSpeed / 1000).toFixed(1);
        });

        // Update data input visibility based on operation
        document.getElementById('operationSelect').addEventListener('change', (e) => {
            const dataInput = document.getElementById('dataInput');
            dataInput.style.display = e.target.value === 'write' ? 'block' : 'none';
        });
    }

    renderInterface() {
        this.renderProcessorCaches();
        this.renderDirectoryTable();
        this.renderNetworkVisualization();
        this.renderPerformanceMetrics();
    }

    renderProcessorCaches() {
        const container = document.getElementById('processorCaches');
        container.innerHTML = '';

        for (let p = 0; p < this.processors; p++) {
            const cacheDiv = document.createElement('div');
            cacheDiv.className = 'column is-12-mobile is-6-tablet is-3-desktop';
            cacheDiv.innerHTML = `
                <div class="processor-cache" id="processor-${p}">
                    <h6 class="title is-6 has-text-centered">Processor ${p}</h6>
                    <div id="cache-blocks-${p}">
                        ${this.memoryBlocks.map(block => `
                            <div class="cache-block invalid" id="cache-${p}-${block}">
                                <div class="cache-block-info">
                                    <div class="cache-block-address">Block ${block}</div>
                                    <div class="cache-block-data">---</div>
                                </div>
                                <span class="tag is-small">I</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            container.appendChild(cacheDiv);
        }
    }

    renderDirectoryTable() {
        const tbody = document.getElementById('directoryTable');
        tbody.innerHTML = '';

        for (let block of this.memoryBlocks) {
            const row = document.createElement('tr');
            row.className = 'directory-entry';
            row.id = `directory-${block}`;
            
            const shareVector = Array.from({length: this.processors}, (_, i) => 
                this.directoryStates[block].sharers.has(i) ? '1' : '0'
            ).join('');

            row.innerHTML = `
                <td><strong>Block ${block}</strong></td>
                <td><span class="directory-state uncached">U</span></td>
                <td>
                    <div class="sharer-vector">
                        ${Array.from({length: this.processors}, (_, i) => `
                            <span class="sharer-bit inactive">${i}</span>
                        `).join('')}
                    </div>
                </td>
                <td>---</td>
            `;
            tbody.appendChild(row);
        }
    }

    renderNetworkVisualization() {
        // The enhanced network visualization is now handled by the HTML structure
        // Network nodes and topology are defined in the HTML with proper IDs
        // This method can be used for any additional initialization if needed
        
        // Initialize node status
        this.updateNodeStatus(0, 'Idle');
        document.getElementById('directoryStatus').textContent = 'Ready';
    }

    renderPerformanceMetrics() {
        const container = document.getElementById('performanceMetrics');
        container.innerHTML = `
            <div class="metric-item">
                <span class="metric-label">Total Operations</span>
                <span class="metric-value">${this.metrics.totalOperations}</span>
            </div>
            <div class="metric-item">
                <span class="metric-label">Cache Hits</span>
                <span class="metric-value">${this.metrics.cacheHits}</span>
            </div>
            <div class="metric-item">
                <span class="metric-label">Cache Misses</span>
                <span class="metric-value">${this.metrics.cacheMisses}</span>
            </div>
            <div class="metric-item">
                <span class="metric-label">Directory Lookups</span>
                <span class="metric-value">${this.metrics.directoryLookups}</span>
            </div>
            <div class="metric-item">
                <span class="metric-label">Network Messages</span>
                <span class="metric-value">${this.metrics.networkMessages}</span>
            </div>
            <div class="metric-item">
                <span class="metric-label">Cache-to-Cache</span>
                <span class="metric-value">${this.metrics.cacheToCache}</span>
            </div>
        `;
    }

    executeOperation() {
        const processor = parseInt(document.getElementById('processorSelect').value);
        const operation = document.getElementById('operationSelect').value;
        const block = document.getElementById('addressSelect').value;
        const data = document.getElementById('dataInput').value || `0x${Math.floor(Math.random() * 256).toString(16).padStart(2, '0')}`;

        this.metrics.totalOperations++;

        if (operation === 'read') {
            this.handleRead(processor, block);
        } else {
            this.handleWrite(processor, block, data);
        }

        this.updateDisplay();
    }

    handleRead(processor, block) {
        const cacheState = this.cacheStates[processor][block];
        
        // Check for cache hit
        if (cacheState.state === 'S' || cacheState.state === 'M') {
            this.metrics.cacheHits++;
            this.logMessage(`P${processor}`, 'Cache Hit', `Read Block ${block} - Local cache hit`, 'success');
            this.highlightProcessor(processor);
            return;
        }

        // Cache miss - proceed with directory protocol
        this.metrics.cacheMisses++;
        this.metrics.directoryLookups++;
        
        const dirState = this.directoryStates[block];
        
        this.logMessage(`P${processor}`, 'Directory', `Read-Request for Block ${block}`, 'read-request');
        this.metrics.networkMessages++;

        if (dirState.state === 'U') {
            // Uncached - provide data from memory
            this.handleReadUncached(processor, block);
        } else if (dirState.state === 'S') {
            // Shared - add to sharers
            this.handleReadShared(processor, block);
        } else if (dirState.state === 'E') {
            // Exclusive - forward request to owner
            this.handleReadExclusive(processor, block);
        }
    }

    handleReadUncached(processor, block) {
        const data = `0x${Math.floor(Math.random() * 256).toString(16).padStart(2, '0')}`;
        
        // Update cache state
        this.cacheStates[processor][block] = {
            state: 'S',
            data: data
        };
        
        // Update directory state
        this.directoryStates[block] = {
            state: 'S',
            sharers: new Set([processor]),
            owner: null
        };
        
        this.logMessage('Directory', `P${processor}`, `Data-Reply for Block ${block} (${data}) from memory`, 'data-reply');
        this.metrics.networkMessages++;
        this.highlightProcessor(processor);
    }

    handleReadShared(processor, block) {
        const data = `0x${Math.floor(Math.random() * 256).toString(16).padStart(2, '0')}`;
        
        // Update cache state
        this.cacheStates[processor][block] = {
            state: 'S',
            data: data
        };
        
        // Add to sharers
        this.directoryStates[block].sharers.add(processor);
        
        this.logMessage('Directory', `P${processor}`, `Data-Reply for Block ${block} (${data}) from memory`, 'data-reply');
        this.metrics.networkMessages++;
        this.highlightProcessor(processor);
    }

    handleReadExclusive(processor, block) {
        const owner = this.directoryStates[block].owner;
        const ownerData = this.cacheStates[owner][block].data;
        
        // Forward request to owner
        this.logMessage('Directory', `P${owner}`, `Forward-Request for Block ${block} to P${processor}`, 'forward-request');
        this.metrics.networkMessages++;
        
        // Owner sends data to requestor and downgrades
        this.cacheStates[processor][block] = {
            state: 'S',
            data: ownerData
        };
        
        this.cacheStates[owner][block].state = 'S';
        
        // Update directory to shared state
        this.directoryStates[block] = {
            state: 'S',
            sharers: new Set([processor, owner]),
            owner: null
        };
        
        this.logMessage(`P${owner}`, `P${processor}`, `Data-Forward Block ${block} (${ownerData})`, 'data-reply');
        this.logMessage(`P${owner}`, 'Directory', `Writeback Block ${block}`, 'data-reply');
        this.metrics.networkMessages += 2;
        this.metrics.cacheToCache++;
        
        this.highlightProcessor(processor);
        this.highlightProcessor(owner);
    }

    handleWrite(processor, block, data) {
        const cacheState = this.cacheStates[processor][block];
        
        // Check if already have exclusive access
        if (cacheState.state === 'M') {
            this.metrics.cacheHits++;
            this.cacheStates[processor][block].data = data;
            this.logMessage(`P${processor}`, 'Cache Hit', `Write Block ${block} (${data}) - Already exclusive`, 'success');
            this.highlightProcessor(processor);
            return;
        }

        // Need to get exclusive access
        this.metrics.cacheMisses++;
        this.metrics.directoryLookups++;
        
        const dirState = this.directoryStates[block];
        
        this.logMessage(`P${processor}`, 'Directory', `Write-Request for Block ${block}`, 'read-request');
        this.metrics.networkMessages++;

        if (dirState.state === 'U') {
            this.handleWriteUncached(processor, block, data);
        } else if (dirState.state === 'S') {
            this.handleWriteShared(processor, block, data);
        } else if (dirState.state === 'E') {
            this.handleWriteExclusive(processor, block, data);
        }
    }

    handleWriteUncached(processor, block, data) {
        // Update cache state to modified
        this.cacheStates[processor][block] = {
            state: 'M',
            data: data
        };
        
        // Update directory state to exclusive
        this.directoryStates[block] = {
            state: 'E',
            sharers: new Set(),
            owner: processor
        };
        
        this.logMessage('Directory', `P${processor}`, `Data-Reply for Block ${block} (exclusive access)`, 'data-reply');
        this.metrics.networkMessages++;
        this.highlightProcessor(processor);
    }

    handleWriteShared(processor, block, data) {
        const sharers = Array.from(this.directoryStates[block].sharers);
        
        // Send invalidations to all current sharers
        for (let sharer of sharers) {
            if (sharer !== processor) {
                this.cacheStates[sharer][block].state = 'I';
                this.logMessage('Directory', `P${sharer}`, `Invalidate Block ${block}`, 'invalidate');
                this.metrics.networkMessages++;
                this.metrics.invalidations++;
            }
        }
        
        // Update requestor to modified state
        this.cacheStates[processor][block] = {
            state: 'M',
            data: data
        };
        
        // Update directory to exclusive
        this.directoryStates[block] = {
            state: 'E',
            sharers: new Set(),
            owner: processor
        };
        
        this.logMessage('Directory', `P${processor}`, `Data-Reply for Block ${block} (exclusive access)`, 'data-reply');
        this.metrics.networkMessages++;
        this.highlightProcessor(processor);
    }

    handleWriteExclusive(processor, block, data) {
        const owner = this.directoryStates[block].owner;
        
        if (owner === processor) {
            // Already the owner, just update data
            this.cacheStates[processor][block].data = data;
            this.metrics.cacheHits++;
            this.logMessage(`P${processor}`, 'Cache Hit', `Write Block ${block} (${data}) - Already owner`, 'success');
        } else {
            // Request from current owner
            this.logMessage('Directory', `P${owner}`, `Forward-Request for Block ${block} to P${processor} (exclusive)`, 'forward-request');
            this.metrics.networkMessages++;
            
            // Owner forwards data and invalidates its copy
            const ownerData = this.cacheStates[owner][block].data;
            this.cacheStates[owner][block].state = 'I';
            
            this.cacheStates[processor][block] = {
                state: 'M',
                data: data
            };
            
            // Update directory ownership
            this.directoryStates[block].owner = processor;
            
            this.logMessage(`P${owner}`, `P${processor}`, `Data-Forward Block ${block} (${ownerData})`, 'data-reply');
            this.metrics.networkMessages++;
            this.metrics.cacheToCache++;
        }
        
        this.highlightProcessor(processor);
    }

    logMessage(from, to, message, type = 'info') {
        const timestamp = this.messageCounter++;
        const logEntry = {
            timestamp,
            from,
            to,
            message,
            type
        };
        
        this.messageLog.push(logEntry);
        this.updateMessageLog();
        
        // Also show network activity
        this.showNetworkActivity(from, to, type, { 
            block: this.extractBlockFromMessage(message),
            value: this.extractValueFromMessage(message)
        });
    }

    // Enhanced Network Visualization Methods
    showNetworkActivity(from, to, messageType, data = {}) {
        const messageOverlay = document.getElementById('messageOverlay');
        const activeMessages = document.getElementById('activeMessages');
        
        // Clear "no active messages" placeholder
        if (activeMessages.querySelector('.has-text-grey-light')) {
            activeMessages.innerHTML = '';
        }
        
        // Add to active messages queue
        const messageItem = document.createElement('div');
        messageItem.className = 'message-item';
        messageItem.innerHTML = `
            <span>${from} → ${to}</span>
            <span class="message-type ${messageType.toLowerCase().replace('-', '_')}">${messageType}</span>
        `;
        activeMessages.appendChild(messageItem);
        
        // Animate the network link
        this.animateNetworkLink(from, to, messageType);
        
        // Create animated message
        this.createAnimatedMessage(from, to, messageType, data);
        
        // Highlight nodes
        this.highlightNodes(from, to, messageType);
        
        // Remove from queue after animation
        setTimeout(() => {
            if (messageItem.parentNode) {
                messageItem.remove();
            }
            if (activeMessages.children.length === 0) {
                activeMessages.innerHTML = '<p class="has-text-grey-light">No active messages</p>';
            }
        }, 3000);
    }

    animateNetworkLink(from, to, messageType) {
        // Determine link ID based on from/to
        let linkId = '';
        
        if (from.includes('P') && to === 'Directory') {
            const pNum = from.replace('P', '');
            linkId = `link-p${pNum}-dir`;
        } else if (from === 'Directory' && to.includes('P')) {
            const pNum = to.replace('P', '');
            linkId = `link-p${pNum}-dir`;
        } else if (from.includes('P') && to.includes('P')) {
            // P2P transfer
            const fromNum = from.replace('P', '');
            const toNum = to.replace('P', '');
            linkId = `link-p${fromNum}-p${toNum}`;
            
            // Also try reverse direction
            if (!document.getElementById(linkId)) {
                linkId = `link-p${toNum}-p${fromNum}`;
            }
        }
        
        const link = document.getElementById(linkId);
        if (link) {
            link.classList.add('active');
            
            // Add P2P class for cache-to-cache transfers
            if (from.includes('P') && to.includes('P')) {
                link.classList.add('p2p-link');
            }
            
            setTimeout(() => {
                link.classList.remove('active');
            }, 3000);
        }
    }

    createAnimatedMessage(from, to, messageType, data) {
        const messageOverlay = document.getElementById('messageOverlay');
        
        // Get positions of from/to nodes
        const fromPos = this.getNodePosition(from);
        const toPos = this.getNodePosition(to);
        
        if (!fromPos || !toPos) return;
        
        // Create message element
        const message = document.createElement('div');
        message.className = `animated-message ${messageType.toLowerCase().replace('-', '_')}`;
        message.textContent = this.getMessageText(messageType, data);
        
        // Position at starting point
        message.style.left = fromPos.x + 'px';
        message.style.top = fromPos.y + 'px';
        
        messageOverlay.appendChild(message);
        
        // Animate to destination
        setTimeout(() => {
            message.style.transition = 'all 2.5s ease-in-out';
            message.style.left = toPos.x + 'px';
            message.style.top = toPos.y + 'px';
        }, 100);
        
        // Remove after animation
        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, 3000);
    }

    getNodePosition(nodeName) {
        let nodeId = '';
        
        if (nodeName === 'Directory') {
            nodeId = 'directoryNode';
        } else if (nodeName.includes('P')) {
            const pNum = nodeName.replace('P', '');
            nodeId = `processorNode${pNum}`;
        }
        
        const node = document.getElementById(nodeId);
        if (!node) return null;
        
        const rect = node.getBoundingClientRect();
        const container = document.getElementById('networkVisualization').getBoundingClientRect();
        
        return {
            x: rect.left - container.left + rect.width / 2 - 30, // Center and adjust for message width
            y: rect.top - container.top + rect.height / 2 - 10   // Center and adjust for message height
        };
    }

    getMessageText(messageType, data) {
        switch (messageType) {
            case 'read-request':
                return `RD ${data.block || ''}`;
            case 'write-request':
                return `WR ${data.block || ''}`;
            case 'data-reply':
                return `DATA ${data.block || ''} (${data.value || '?'})`;
            case 'invalidate':
                return `INV ${data.block || ''}`;
            case 'forward-request':
                return `FWD ${data.block || ''}`;
            case 'data-forward':
                return `FWD-DATA ${data.block || ''}`;
            default:
                return messageType;
        }
    }

    highlightNodes(from, to, messageType) {
        // Clear previous highlights
        document.querySelectorAll('.network-node').forEach(node => {
            node.classList.remove('requesting', 'responding', 'active');
        });
        
        // Highlight source node
        const fromNode = this.getNodeElement(from);
        if (fromNode) {
            fromNode.classList.add('requesting');
            fromNode.classList.add('active');
        }
        
        // Highlight destination node
        const toNode = this.getNodeElement(to);
        if (toNode) {
            toNode.classList.add('responding');
            setTimeout(() => {
                toNode.classList.add('active');
            }, 1000);
        }
        
        // Clear highlights after animation
        setTimeout(() => {
            document.querySelectorAll('.network-node').forEach(node => {
                node.classList.remove('requesting', 'responding', 'active');
            });
        }, 3500);
    }

    getNodeElement(nodeName) {
        if (nodeName === 'Directory') {
            return document.getElementById('directoryNode');
        } else if (nodeName.includes('P')) {
            const pNum = nodeName.replace('P', '');
            return document.getElementById(`processorNode${pNum}`);
        }
        return null;
    }

    updateNodeStatus(processor, status) {
        const statusElement = document.getElementById(`p${processor}Status`);
        if (statusElement) {
            statusElement.textContent = status;
        }
        
        const directoryStatus = document.getElementById('directoryStatus');
        if (directoryStatus) {
            directoryStatus.textContent = 'Processing...';
            setTimeout(() => {
                directoryStatus.textContent = 'Ready';
            }, 2000);
        }
    }

    extractBlockFromMessage(message) {
        const blockMatch = message.match(/block ([A-D])/i);
        return blockMatch ? blockMatch[1] : '';
    }

    extractValueFromMessage(message) {
        const valueMatch = message.match(/value (0x[0-9A-F]+)/i);
        return valueMatch ? valueMatch[1] : '';
    }

    updateMessageLog() {
        const container = document.getElementById('messageLog');
        container.innerHTML = this.messageLog.slice(-10).map(entry => `
            <div class="log-entry ${entry.type}">
                <span class="log-timestamp">${entry.timestamp.toString().padStart(3, '0')}</span>
                <span class="log-message">
                    <strong>${entry.from} → ${entry.to}:</strong> ${entry.message}
                </span>
            </div>
        `).join('');
        
        container.scrollTop = container.scrollHeight;
    }

    highlightProcessor(processor) {
        // Remove previous highlights
        document.querySelectorAll('.processor-cache').forEach(cache => {
            cache.classList.remove('active');
        });
        
        // Highlight the active processor
        const processorElement = document.getElementById(`processor-${processor}`);
        if (processorElement) {
            processorElement.classList.add('active');
        }
        
        // Update network node status
        this.updateNodeStatus(processor, 'Active');
        
        // Reset status after delay
        setTimeout(() => {
            this.updateNodeStatus(processor, 'Idle');
        }, 2000);
    }

    updateDisplay() {
        this.updateCacheDisplay();
        this.updateDirectoryDisplay();
        this.renderPerformanceMetrics();
    }

    updateCacheDisplay() {
        for (let p = 0; p < this.processors; p++) {
            for (let block of this.memoryBlocks) {
                const cacheBlock = document.getElementById(`cache-${p}-${block}`);
                const state = this.cacheStates[p][block];
                
                // Update visual state
                cacheBlock.className = `cache-block ${state.state.toLowerCase()}`;
                
                // Update data display
                const dataDiv = cacheBlock.querySelector('.cache-block-data');
                dataDiv.textContent = state.state === 'I' ? '---' : (state.data || '0x00');
                
                // Update state tag
                const tag = cacheBlock.querySelector('.tag');
                tag.textContent = state.state;
                tag.className = `tag is-small ${state.state === 'I' ? 'is-danger' : state.state === 'S' ? 'is-info' : 'is-warning'}`;
            }
        }
    }

    updateDirectoryDisplay() {
        for (let block of this.memoryBlocks) {
            const row = document.getElementById(`directory-${block}`);
            const dirState = this.directoryStates[block];
            
            // Update state
            const stateSpan = row.querySelector('.directory-state');
            stateSpan.textContent = dirState.state;
            stateSpan.className = `directory-state ${dirState.state.toLowerCase()}`;
            
            // Update sharer vector
            const sharerBits = row.querySelectorAll('.sharer-bit');
            sharerBits.forEach((bit, index) => {
                if (dirState.sharers.has(index)) {
                    bit.className = 'sharer-bit active';
                } else {
                    bit.className = 'sharer-bit inactive';
                }
            });
            
            // Update owner
            const ownerCell = row.cells[3];
            ownerCell.textContent = dirState.owner !== null ? `P${dirState.owner}` : '---';
        }
    }

    stepThroughOperation() {
        // If no operation is in progress, start a new one
        if (!this.currentOperation) {
            this.startStepThroughOperation();
            return;
        }

        // Continue with the current operation
        if (this.currentStep < this.operationSteps.length) {
            this.executeStep(this.operationSteps[this.currentStep]);
            this.currentStep++;
            this.updateOperationStatus();
        }

        // Check if operation is complete
        if (this.currentStep >= this.operationSteps.length) {
            this.finishStepThroughOperation();
        }
    }

    startStepThroughOperation() {
        const processor = parseInt(document.getElementById('processorSelect').value);
        const operation = document.getElementById('operationSelect').value;
        const block = document.getElementById('addressSelect').value;
        const data = document.getElementById('dataInput').value || `0x${Math.floor(Math.random() * 256).toString(16).padStart(2, '0')}`;

        this.currentOperation = {
            processor,
            operation,
            block,
            data,
            startTime: Date.now()
        };

        this.metrics.totalOperations++;
        this.currentStep = 0;

        // Generate the steps for this operation
        this.generateOperationSteps();
        
        // Update UI to show step-through mode
        this.updateOperationStatus();
        this.updateStepControls();
        
        // Highlight the initiating processor
        this.highlightProcessor(processor);
        
        // Show first step
        if (this.operationSteps.length > 0) {
            this.showStepPreview(this.operationSteps[0]);
        }
    }

    generateOperationSteps() {
        const { processor, operation, block, data } = this.currentOperation;
        const cacheState = this.cacheStates[processor][block];
        const dirState = this.directoryStates[block];
        
        this.operationSteps = [];

        // Step 1: Initial state check
        this.operationSteps.push({
            type: 'cache_check',
            processor,
            block,
            description: `P${processor} checks local cache for Block ${block}`,
            details: `Current cache state: ${cacheState.state}`,
            action: () => this.visualizeCacheCheck(processor, block)
        });

        if (operation === 'read') {
            if (cacheState.state === 'S' || cacheState.state === 'M') {
                // Cache hit case
                this.operationSteps.push({
                    type: 'cache_hit',
                    processor,
                    block,
                    description: `Cache hit! Read Block ${block} from local cache`,
                    details: `Data: ${cacheState.data}`,
                    action: () => this.visualizeCacheHit(processor, block)
                });
            } else {
                // Cache miss - add directory lookup steps
                this.generateReadMissSteps(processor, block, dirState);
            }
        } else { // write operation
            if (cacheState.state === 'M') {
                // Write hit case
                this.operationSteps.push({
                    type: 'cache_hit',
                    processor,
                    block,
                    description: `Write hit! Update Block ${block} in local cache`,
                    details: `Old data: ${cacheState.data}, New data: ${data}`,
                    action: () => this.visualizeWriteHit(processor, block, data)
                });
            } else {
                // Write miss or need exclusive access
                this.generateWriteMissSteps(processor, block, data, dirState);
            }
        }

        // Final step: Operation complete
        this.operationSteps.push({
            type: 'complete',
            processor,
            block,
            description: `Operation complete`,
            details: `${operation.charAt(0).toUpperCase() + operation.slice(1)} operation finished successfully`,
            action: () => this.visualizeOperationComplete(processor, block)
        });
    }

    generateReadMissSteps(processor, block, dirState) {
        // Step 2: Send request to directory
        this.operationSteps.push({
            type: 'directory_request',
            processor,
            block,
            description: `Send Read-Request to Directory for Block ${block}`,
            details: `Cache miss detected, contacting directory controller`,
            action: () => this.visualizeDirectoryRequest(processor, block, 'read')
        });

        // Step 3: Directory lookup
        this.operationSteps.push({
            type: 'directory_lookup',
            processor,
            block,
            description: `Directory looks up Block ${block} state`,
            details: `Current directory state: ${dirState.state}, Sharers: [${Array.from(dirState.sharers).join(', ')}], Owner: ${dirState.owner || 'None'}`,
            action: () => this.visualizeDirectoryLookup(block)
        });

        if (dirState.state === 'U') {
            // Uncached case
            this.operationSteps.push({
                type: 'memory_fetch',
                processor,
                block,
                description: `Fetch Block ${block} from main memory`,
                details: `Block not cached anywhere, retrieving from memory`,
                action: () => this.visualizeMemoryFetch(block)
            });

            this.operationSteps.push({
                type: 'data_reply',
                processor,
                block,
                description: `Send data to P${processor} and update directory`,
                details: `Set cache to Shared, add P${processor} to sharers`,
                action: () => this.visualizeDataReply(processor, block, 'memory')
            });
        } else if (dirState.state === 'S') {
            // Shared case
            this.operationSteps.push({
                type: 'data_reply',
                processor,
                block,
                description: `Send data to P${processor} from memory/cache`,
                details: `Add P${processor} to existing sharers list`,
                action: () => this.visualizeDataReply(processor, block, 'shared')
            });
        } else { // Exclusive case
            const owner = dirState.owner;
            this.operationSteps.push({
                type: 'forward_request',
                processor,
                block,
                owner,
                description: `Forward request to owner P${owner}`,
                details: `P${owner} currently has exclusive access`,
                action: () => this.visualizeForwardRequest(processor, block, owner)
            });

            this.operationSteps.push({
                type: 'owner_response',
                processor,
                block,
                owner,
                description: `P${owner} downgrades and forwards data`,
                details: `Owner changes from Modified to Shared`,
                action: () => this.visualizeOwnerResponse(processor, block, owner)
            });

            this.operationSteps.push({
                type: 'directory_update',
                processor,
                block,
                owner,
                description: `Directory updates to Shared state`,
                details: `Both P${processor} and P${owner} now share the block`,
                action: () => this.visualizeDirectoryUpdate(block, 'shared', [processor, owner])
            });
        }
    }

    generateWriteMissSteps(processor, block, data, dirState) {
        // Step 2: Send write request to directory
        this.operationSteps.push({
            type: 'directory_request',
            processor,
            block,
            description: `Send Write-Request to Directory for Block ${block}`,
            details: `Need exclusive access for write operation`,
            action: () => this.visualizeDirectoryRequest(processor, block, 'write')
        });

        // Step 3: Directory lookup
        this.operationSteps.push({
            type: 'directory_lookup',
            processor,
            block,
            description: `Directory looks up Block ${block} state`,
            details: `Current directory state: ${dirState.state}, Sharers: [${Array.from(dirState.sharers).join(', ')}], Owner: ${dirState.owner || 'None'}`,
            action: () => this.visualizeDirectoryLookup(block)
        });

        if (dirState.state === 'U') {
            // Uncached case
            this.operationSteps.push({
                type: 'exclusive_grant',
                processor,
                block,
                description: `Grant exclusive access to P${processor}`,
                details: `Block not cached anywhere, grant exclusive immediately`,
                action: () => this.visualizeExclusiveGrant(processor, block, data)
            });
        } else if (dirState.state === 'S') {
            // Shared case - need to invalidate sharers
            const sharers = Array.from(dirState.sharers).filter(p => p !== processor);
            
            if (sharers.length > 0) {
                this.operationSteps.push({
                    type: 'invalidate_sharers',
                    processor,
                    block,
                    sharers,
                    description: `Send invalidations to current sharers`,
                    details: `Invalidate copies at: P${sharers.join(', P')}`,
                    action: () => this.visualizeInvalidateSharers(block, sharers)
                });

                this.operationSteps.push({
                    type: 'invalidate_acks',
                    processor,
                    block,
                    sharers,
                    description: `Collect invalidation acknowledgments`,
                    details: `Wait for acks from all invalidated processors`,
                    action: () => this.visualizeInvalidateAcks(sharers)
                });
            }

            this.operationSteps.push({
                type: 'exclusive_grant',
                processor,
                block,
                description: `Grant exclusive access to P${processor}`,
                details: `All other copies invalidated, grant exclusive access`,
                action: () => this.visualizeExclusiveGrant(processor, block, data)
            });
        } else { // Exclusive case
            const owner = dirState.owner;
            
            if (owner === processor) {
                // Already the owner
                this.operationSteps.push({
                    type: 'write_hit',
                    processor,
                    block,
                    description: `Write hit! P${processor} already owns the block`,
                    details: `Update data directly in cache`,
                    action: () => this.visualizeWriteHit(processor, block, data)
                });
            } else {
                this.operationSteps.push({
                    type: 'forward_request',
                    processor,
                    block,
                    owner,
                    description: `Forward write request to owner P${owner}`,
                    details: `P${owner} currently has exclusive access`,
                    action: () => this.visualizeForwardRequest(processor, block, owner, 'write')
                });

                this.operationSteps.push({
                    type: 'ownership_transfer',
                    processor,
                    block,
                    owner,
                    description: `P${owner} transfers ownership to P${processor}`,
                    details: `Owner invalidates local copy and forwards data`,
                    action: () => this.visualizeOwnershipTransfer(processor, block, owner, data)
                });

                this.operationSteps.push({
                    type: 'directory_update',
                    processor,
                    block,
                    description: `Directory updates owner to P${processor}`,
                    details: `P${processor} now has exclusive access`,
                    action: () => this.visualizeDirectoryUpdate(block, 'exclusive', [], processor)
                });
            }
        }
    }

    executeStep(step) {
        // Execute the step's action
        if (step.action) {
            step.action();
        }

        // Update metrics based on step type
        switch (step.type) {
            case 'cache_hit':
                this.metrics.cacheHits++;
                break;
            case 'directory_request':
                this.metrics.cacheMisses++;
                this.metrics.directoryLookups++;
                this.metrics.networkMessages++;
                break;
            case 'data_reply':
            case 'forward_request':
            case 'invalidate_sharers':
            case 'ownership_transfer':
                this.metrics.networkMessages++;
                break;
            case 'invalidate_sharers':
                this.metrics.invalidations += step.sharers ? step.sharers.length : 0;
                break;
            case 'owner_response':
            case 'ownership_transfer':
                this.metrics.cacheToCache++;
                break;
        }

        // Log the step
        this.logStepMessage(step);
    }

    logStepMessage(step) {
        let from, to, message, type;
        
        switch (step.type) {
            case 'cache_check':
                from = `P${step.processor}`;
                to = 'Local Cache';
                message = step.description;
                type = 'info';
                break;
            case 'cache_hit':
                from = `P${step.processor}`;
                to = 'Local Cache';
                message = step.description;
                type = 'success';
                break;
            case 'directory_request':
                from = `P${step.processor}`;
                to = 'Directory';
                message = step.description;
                type = 'read-request';
                break;
            case 'directory_lookup':
                from = 'Directory';
                to = 'Internal';
                message = step.description;
                type = 'info';
                break;
            case 'data_reply':
                from = 'Directory';
                to = `P${step.processor}`;
                message = step.description;
                type = 'data-reply';
                break;
            case 'forward_request':
                from = 'Directory';
                to = `P${step.owner}`;
                message = step.description;
                type = 'forward-request';
                break;
            case 'invalidate_sharers':
                from = 'Directory';
                to = `P${step.sharers.join(', P')}`;
                message = step.description;
                type = 'invalidate';
                break;
            default:
                from = 'System';
                to = 'All';
                message = step.description;
                type = 'info';
        }
        
        this.logMessage(from, to, message, type);
    }

    // Visualization methods for each step type
    visualizeCacheCheck(processor, block) {
        this.highlightProcessor(processor);
        this.highlightCacheBlock(processor, block);
        this.showNetworkActivity(processor, 'self', 'Cache Check');
    }

    visualizeCacheHit(processor, block) {
        this.highlightProcessor(processor);
        this.animateCacheBlock(processor, block, 'hit');
    }

    visualizeWriteHit(processor, block, data) {
        this.cacheStates[processor][block].data = data;
        this.highlightProcessor(processor);
        this.animateCacheBlock(processor, block, 'write');
        this.updateCacheDisplay();
    }

    visualizeDirectoryRequest(processor, block, operation) {
        this.showNetworkActivity(processor, 'directory', `${operation.charAt(0).toUpperCase() + operation.slice(1)} Request`);
        this.highlightDirectoryEntry(block);
    }

    visualizeDirectoryLookup(block) {
        this.highlightDirectoryEntry(block);
        this.animateDirectoryEntry(block);
    }

    visualizeMemoryFetch(block) {
        this.showNetworkActivity('memory', 'directory', 'Memory Fetch');
        this.animateDirectoryEntry(block);
    }

    visualizeDataReply(processor, block, source) {
        // Update cache state
        const data = `0x${Math.floor(Math.random() * 256).toString(16).padStart(2, '0')}`;
        this.cacheStates[processor][block] = {
            state: 'S',
            data: data
        };

        // Update directory state
        this.directoryStates[block].state = 'S';
        this.directoryStates[block].sharers.add(processor);
        this.directoryStates[block].owner = null;

        this.showNetworkActivity('directory', processor, 'Data Reply');
        this.updateDisplay();
    }

    visualizeForwardRequest(processor, block, owner, type = 'read') {
        this.showNetworkActivity('directory', owner, 'Forward Request');
        this.highlightProcessor(owner);
        this.highlightCacheBlock(owner, block);
    }

    visualizeOwnerResponse(processor, block, owner) {
        // Owner downgrades to shared
        this.cacheStates[owner][block].state = 'S';
        
        // New requestor gets shared copy
        const data = this.cacheStates[owner][block].data;
        this.cacheStates[processor][block] = {
            state: 'S',
            data: data
        };

        this.showNetworkActivity(owner, processor, 'Data Forward');
        this.updateDisplay();
    }

    visualizeInvalidateSharers(block, sharers) {
        sharers.forEach(sharer => {
            this.cacheStates[sharer][block].state = 'I';
            this.showNetworkActivity('directory', sharer, 'Invalidate');
            this.animateCacheBlock(sharer, block, 'invalidate');
        });
        this.updateDisplay();
    }

    visualizeInvalidateAcks(sharers) {
        sharers.forEach(sharer => {
            this.showNetworkActivity(sharer, 'directory', 'Inv-Ack');
        });
    }

    visualizeExclusiveGrant(processor, block, data) {
        this.cacheStates[processor][block] = {
            state: 'M',
            data: data
        };

        this.directoryStates[block] = {
            state: 'E',
            sharers: new Set(),
            owner: processor
        };

        this.showNetworkActivity('directory', processor, 'Exclusive Grant');
        this.updateDisplay();
    }

    visualizeOwnershipTransfer(processor, block, owner, data) {
        // Owner invalidates its copy
        this.cacheStates[owner][block].state = 'I';
        
        // New processor gets modified copy
        this.cacheStates[processor][block] = {
            state: 'M',
            data: data
        };

        this.showNetworkActivity(owner, processor, 'Ownership Transfer');
        this.updateDisplay();
    }

    visualizeDirectoryUpdate(block, newState, sharers = [], owner = null) {
        this.directoryStates[block] = {
            state: newState === 'shared' ? 'S' : 'E',
            sharers: new Set(sharers),
            owner: owner
        };

        this.animateDirectoryEntry(block);
        this.updateDisplay();
    }

    visualizeOperationComplete(processor, block) {
        this.highlightProcessor(processor);
        this.showCompletionAnimation();
    }

    // Helper visualization methods
    highlightCacheBlock(processor, block) {
        const blockElement = document.getElementById(`cache-${processor}-${block}`);
        if (blockElement) {
            blockElement.classList.add('highlighted');
            setTimeout(() => blockElement.classList.remove('highlighted'), 2000);
        }
    }

    animateCacheBlock(processor, block, animationType) {
        const blockElement = document.getElementById(`cache-${processor}-${block}`);
        if (blockElement) {
            blockElement.classList.add(`animate-${animationType}`);
            setTimeout(() => blockElement.classList.remove(`animate-${animationType}`), 1000);
        }
    }

    highlightDirectoryEntry(block) {
        const rowElement = document.getElementById(`directory-${block}`);
        if (rowElement) {
            rowElement.classList.add('highlight');
            setTimeout(() => rowElement.classList.remove('highlight'), 2000);
        }
    }

    animateDirectoryEntry(block) {
        const rowElement = document.getElementById(`directory-${block}`);
        if (rowElement) {
            rowElement.classList.add('animate-lookup');
            setTimeout(() => rowElement.classList.remove('animate-lookup'), 1000);
        }
    }

    showNetworkActivity(from, to, messageType) {
        // Create visual indication of network message
        const container = document.getElementById('networkVisualization');
        const message = document.createElement('div');
        message.className = 'network-activity';
        message.textContent = `${from} → ${to}: ${messageType}`;
        message.style.cssText = `
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(72, 95, 199, 0.9);
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            animation: networkMessageFade 3s ease-out forwards;
            z-index: 10;
        `;
        
        container.appendChild(message);
        
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 3000);
    }

    showCompletionAnimation() {
        // Show a completion indicator
        const container = document.getElementById('operationStatus');
        const completion = document.createElement('div');
        completion.className = 'completion-indicator';
        completion.innerHTML = '<i class="fas fa-check-circle"></i> Operation Complete!';
        completion.style.cssText = `
            color: #48c78e;
            font-weight: bold;
            animation: completionPulse 2s ease-out;
        `;
        
        container.appendChild(completion);
        
        setTimeout(() => {
            if (completion.parentNode) {
                completion.parentNode.removeChild(completion);
            }
        }, 2000);
    }

    updateOperationStatus() {
        const container = document.getElementById('operationStatus');
        
        if (!this.currentOperation) {
            container.innerHTML = '<p class="has-text-grey">No operation in progress</p>';
            return;
        }

        const { processor, operation, block, data } = this.currentOperation;
        
        let html = `
            <div class="operation-header">
                <h6 class="title is-6">
                    P${processor} ${operation.toUpperCase()} Block ${block}
                    ${operation === 'write' ? `(${data})` : ''}
                </h6>
                <div class="progress-bar">
                    <progress class="progress is-primary" value="${this.currentStep}" max="${this.operationSteps.length}">
                        ${Math.round((this.currentStep / this.operationSteps.length) * 100)}%
                    </progress>
                </div>
            </div>
            <div class="operation-steps">
        `;

        this.operationSteps.forEach((step, index) => {
            const isCompleted = index < this.currentStep;
            const isCurrent = index === this.currentStep;
            const statusClass = isCompleted ? 'completed' : isCurrent ? 'current' : '';
            
            html += `
                <div class="operation-step ${statusClass}">
                    <div class="step-number ${statusClass}">${index + 1}</div>
                    <div class="step-content">
                        <div class="step-description">${step.description}</div>
                        <div class="step-details">${step.details}</div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    }

    showStepPreview(step) {
        // Show what the next step will do
        const preview = document.createElement('div');
        preview.className = 'step-preview';
        preview.innerHTML = `
            <div class="notification is-info is-light">
                <strong>Next Step:</strong> ${step.description}
                <br>
                <small>${step.details}</small>
            </div>
        `;
        
        const container = document.getElementById('operationStatus');
        const existing = container.querySelector('.step-preview');
        if (existing) {
            existing.remove();
        }
        
        container.appendChild(preview);
    }

    finishStepThroughOperation() {
        // Clean up step-through operation
        this.currentOperation = null;
        this.operationSteps = [];
        this.currentStep = 0;
        this.autoStepping = false;
        
        // Update UI
        this.updateOperationStatus();
        this.renderPerformanceMetrics();
        this.updateStepControls();
        
        // Show completion message
        setTimeout(() => {
            const notification = document.createElement('div');
            notification.className = 'notification is-success is-light';
            notification.innerHTML = `
                <button class="delete" onclick="this.parentElement.remove()"></button>
                <strong>Step-through complete!</strong> You can start a new operation or continue exploring.
            `;
            
            const container = document.querySelector('.section .container');
            container.insertBefore(notification, container.firstChild);
            
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 5000);
        }, 500);
    }

    toggleAutoStep() {
        if (!this.currentOperation) {
            // Start a new operation in auto-step mode
            this.startStepThroughOperation();
            this.autoStepping = true;
            this.scheduleNextAutoStep();
        } else if (this.autoStepping) {
            // Stop auto-stepping
            this.autoStepping = false;
            this.updateStepControls();
        } else {
            // Resume auto-stepping
            this.autoStepping = true;
            this.scheduleNextAutoStep();
        }
        
        this.updateStepControls();
    }

    scheduleNextAutoStep() {
        if (!this.autoStepping || this.currentStep >= this.operationSteps.length) {
            return;
        }
        
        setTimeout(() => {
            if (this.autoStepping && this.currentStep < this.operationSteps.length) {
                this.stepThroughOperation();
                if (this.currentStep < this.operationSteps.length) {
                    this.scheduleNextAutoStep();
                }
            }
        }, this.stepSpeed);
    }

    updateStepControls() {
        const stepControls = document.getElementById('stepControls');
        const autoStepBtn = document.getElementById('autoStepBtn');
        const stepBtn = document.getElementById('stepBtn');
        
        if (this.currentOperation) {
            stepControls.style.display = 'block';
            
            if (this.autoStepping) {
                autoStepBtn.innerHTML = '<span class="icon"><i class="fas fa-pause"></i></span><span>Pause Auto</span>';
                autoStepBtn.className = 'button is-warning is-medium';
                stepBtn.disabled = true;
            } else {
                autoStepBtn.innerHTML = '<span class="icon"><i class="fas fa-play-circle"></i></span><span>Resume Auto</span>';
                autoStepBtn.className = 'button is-info is-medium';
                stepBtn.disabled = false;
            }
        } else {
            stepControls.style.display = 'none';
            autoStepBtn.innerHTML = '<span class="icon"><i class="fas fa-play-circle"></i></span><span>Auto Step</span>';
            autoStepBtn.className = 'button is-info is-medium';
            stepBtn.disabled = false;
        }
    }

    resetSimulation() {
        this.autoStepping = false;
        this.initializeState();
        this.updateDisplay();
        this.updateMessageLog();
        this.updateStepControls();
        document.getElementById('operationStatus').innerHTML = '<p class="has-text-grey">No operation in progress</p>';
        
        // Remove highlights
        document.querySelectorAll('.processor-cache').forEach(cache => {
            cache.classList.remove('active');
        });
        
        // Clear any notifications
        document.querySelectorAll('.notification').forEach(notification => {
            if (notification.querySelector('.delete')) {
                notification.remove();
            }
        });
    }

    resetSimulation() {
        this.initializeState();
        this.updateDisplay();
        this.updateMessageLog();
        document.getElementById('operationStatus').innerHTML = '<p class="has-text-grey">No operation in progress</p>';
        
        // Remove highlights
        document.querySelectorAll('.processor-cache').forEach(cache => {
            cache.classList.remove('active');
        });
    }

    clearLog() {
        this.messageLog = [];
        this.messageCounter = 0;
        this.updateMessageLog();
    }
}

// Initialize the simulator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.simulator = new DirectoryCoherenceSimulator();
});

// Mobile touch support
document.addEventListener('touchstart', function() {}, true);
