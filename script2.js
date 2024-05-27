function generateNodes() {
    const canvas = document.getElementById('canvas');
    const nodeCount = document.getElementById('nodeCount').value;
    canvas.innerHTML = ''; // Clear previous nodes

    if (nodeCount < 2 || nodeCount > 7) {
        alert('Please enter a number between 2 and 7.');
        return;
    }

    // Create center node
    const centerNode = document.createElement('div');
    centerNode.className = 'center-node';
    centerNode.innerText = 'O';
    centerNode.style.top = '235px';
    centerNode.style.left = '235px';
    canvas.appendChild(centerNode);

    // Create surrounding nodes
    const angleStep = (2 * Math.PI) / nodeCount;
    const radius = 150;
    const labels = 'ABCDEFG'.split('');

    for (let i = 0; i < nodeCount; i++) {
        const angle = i * angleStep;
        const x = 250 + radius * Math.cos(angle) - 15; // 250 is the center of the canvas
        const y = 250 + radius * Math.sin(angle) - 15;
        
        const node = document.createElement('div');
        node.className = 'node';
        node.innerText = labels[i];
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;
        canvas.appendChild(node);
    }

    // Generate distance table
    generateTable(nodeCount);
}

function generateTable(nodeCount) {
    const tableContainer = document.getElementById('tableContainer');
    tableContainer.innerHTML = ''; // Clear previous table

    const labels = 'ABCDEFG'.split('');

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    // Create header row
    const headerRow = document.createElement('tr');
    headerRow.appendChild(document.createElement('th')); // Empty top-left cell
    labels.slice(0, nodeCount).forEach(label => {
        const th = document.createElement('th');
        th.innerText = label;
        headerRow.appendChild(th);
    });
    headerRow.appendChild(document.createElement('th')).innerText = 'Dist to O';
    headerRow.appendChild(document.createElement('th')).innerText = 'Cost';
    thead.appendChild(headerRow);

    // Create body rows
    for (let i = 0; i < nodeCount; i++) {
        const row = document.createElement('tr');
        const labelCell = document.createElement('th');
        labelCell.innerText = labels[i];
        row.appendChild(labelCell);

        for (let j = 0; j < nodeCount; j++) {
            const cell = document.createElement('td');
            if (j > i) {
                cell.contentEditable = true;
                cell.oninput = function() {
                    updateTable(i, j, this.innerText);
                };
            } else if (j <= i) {
                cell.innerText = '-';
            }
            row.appendChild(cell);
        }

        // Distance to O and Cost cells
        const distToOCell = document.createElement('td');
        distToOCell.contentEditable = true;
        distToOCell.oninput = function() {
            // Optionally, handle input for distance to center node
        };
        row.appendChild(distToOCell);

        const costCell = document.createElement('td');
        costCell.contentEditable = true;
        costCell.oninput = function() {
            // Optionally, handle input for cost
        };
        row.appendChild(costCell);

        tbody.appendChild(row);
    }

    table.appendChild(thead);
    table.appendChild(tbody);
    tableContainer.appendChild(table);
}

function updateTable(row, col, value) {
    const table = document.querySelector('table');
    const cell = table.rows[col + 1].cells[row + 1]; // +1 to account for header row and label column
    cell.innerText = value;
}


function linkNodes(from, to) {
    const nodes = document.querySelectorAll('.node');
    const fromNode = nodes[from];
    const toNode = nodes[to];

    const arrow = document.createElement('div');
    arrow.className = 'arrow';
    
    const fromRect = fromNode.getBoundingClientRect();
    const toRect = toNode.getBoundingClientRect();

    const canvasRect = document.getElementById('canvas').getBoundingClientRect();

    const startX = fromRect.left - canvasRect.left + fromRect.width / 2;
    const startY = fromRect.top - canvasRect.top + fromRect.height / 2;
    const endX = toRect.left - canvasRect.left + toRect.width / 2;
    const endY = toRect.top - canvasRect.top + toRect.height / 2;

    const dx = endX - startX;
    const dy = endY - startY;
    const angle = Math.atan2(dy, dx);

    arrow.style.transform = `rotate(${angle}rad)`;
    arrow.style.left = `${startX}px`;
    arrow.style.top = `${startY}px`;
    arrow.style.width = `${Math.sqrt(dx * dx + dy * dy)}px`;

    canvas.appendChild(arrow);
}