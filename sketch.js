const fallbackData = [
  { Day: 'Wednesday, October 28th', 'Number of Shirts': 2, Materials: 'Cotton', '# of Changes': 0, 'Type of Pants': 'Cargo' },
  { Day: 'Thursday, October 29th', 'Number of Shirts': 3, Materials: 'Wool', '# of Changes': 2, 'Type of Pants': 'Jeans' },
  { Day: 'Friday, October 30th\'', 'Number of Shirts': 2, Materials: 'Cotton', '# of Changes': 0, 'Type of Pants': 'Jeans' },
  { Day: 'Saturday, October 31st', 'Number of Shirts': 1, Materials: 'Polyester', '# of Changes': 0, 'Type of Pants': 'Jeans' },
  { Day: 'Sunday, November 1st', 'Number of Shirts': 1, Materials: 'Mixed', '# of Changes': 0, 'Type of Pants': 'Sweatpants' },
  { Day: 'Monday, November 2nd', 'Number of Shirts': 3, Materials: 'Mixed', '# of Changes': 0, 'Type of Pants': 'Cargo' },
  { Day: 'Tuesday, November 3rd', 'Number of Shirts': 1, Materials: 'Mixed', '# of Changes': 1, 'Type of Pants': 'Slacks' },
  { Day: 'Wednesday, November 4th', 'Number of Shirts': 1, Materials: 'Cotton', '# of Changes': 2, 'Type of Pants': 'Slacks' }
];

const materialColors = {
  Cotton: '#4E79A7',
  Wool: '#F28E2B',
  Polyester: '#59A14F',
  Mixed: '#E15759'
};

const orientationMap = {
  Cargo: 'right',
  Jeans: 'down',
  Sweatpants: 'left',
  Slacks: 'up'
};

const svg = document.getElementById('chart');

function createSVG(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
  return el;
}

function shorthandDay(dayLabel) {
  const match = dayLabel.match(/^[A-Za-z]+/);
  return match ? match[0].slice(0, 3) : dayLabel;
}

function drawTriangle(cx, cy, size, direction) {
  const points = {
    up: `${cx},${cy - size} ${cx - size},${cy + size} ${cx + size},${cy + size}`,
    down: `${cx},${cy + size} ${cx - size},${cy - size} ${cx + size},${cy - size}`,
    left: `${cx - size},${cy} ${cx + size},${cy - size} ${cx + size},${cy + size}`,
    right: `${cx + size},${cy} ${cx - size},${cy - size} ${cx - size},${cy + size}`
  };

  const triangle = createSVG('polygon', {
    points: points[direction] || points.right,
    fill: '#2d3748',
    opacity: 0.9,
    stroke: '#2d3748',
    'stroke-width': 1
  });

  triangle.setAttribute('transform', `translate(0,0)`);
  svg.appendChild(triangle);
}

function drawSquiggleMarker(cx, cy, color) {
  const amplitude = 9;
  const spread = 18;
  const d = [
    `M ${cx - spread} ${cy}`,
    `Q ${cx - spread * 0.7} ${cy - amplitude * 1.2} ${cx - spread * 0.3} ${cy}`,
    `Q ${cx} ${cy + amplitude * 1.4} ${cx + spread * 0.3} ${cy}`,
    `Q ${cx + spread * 0.7} ${cy - amplitude * 1.1} ${cx + spread} ${cy}`,
    `Q ${cx + spread * 0.4} ${cy + amplitude * 0.9} ${cx} ${cy}`,
    `Q ${cx - spread * 0.5} ${cy - amplitude * 0.8} ${cx - spread} ${cy}`
  ].join(' ');

  return createSVG('path', {
    d,
    fill: 'none',
    stroke: color,
    'stroke-width': 2.5,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round'
  });
}

function render(data) {
  svg.innerHTML = '';

  const width = 960;
  const height = 640;
  const margins = { top: 70, right: 40, bottom: 160, left: 80 };
  const chartWidth = width - margins.left - margins.right;
  const chartHeight = height - margins.top - margins.bottom;

  const upperBaseline = margins.top + 48;
  const lowerBaseline = height - margins.bottom + 28;
  const maxShirts = Math.max(...data.map(d => d['Number of Shirts']));

  const xStep = chartWidth / (data.length - 1);
  const xPositions = data.map((_, i) => margins.left + i * xStep);

  const yForShirts = value => upperBaseline + (maxShirts - value) * ((chartHeight - 40) / maxShirts);
  const yForChanges = value => lowerBaseline + value * 28;

  for (let i = 0; i <= maxShirts; i++) {
    const y = yForShirts(i);
    const line = createSVG('line', {
      x1: margins.left,
      y1: y,
      x2: width - margins.right,
      y2: y,
      stroke: '#dfe3e8',
      'stroke-width': 1
    });
    svg.appendChild(line);
  }

  const allCurvePoints = data.map((entry, index) => ({
    x: xPositions[index],
    y: yForShirts(entry['Number of Shirts'])
  }));

  const baseCurve = createSVG('path', {
    d: allCurvePoints.reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = allCurvePoints[i - 1];
      const cx = (prev.x + p.x) / 2;
      return `${acc} Q ${cx} ${prev.y} ${p.x} ${p.y}`;
    }, ''),
    fill: 'none',
    stroke: '#2d3748',
    'stroke-width': 3,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round'
  });
  svg.appendChild(baseCurve);

  data.forEach((entry, index) => {
    const cx = xPositions[index];
    const shirtY = yForShirts(entry['Number of Shirts']);
    const color = materialColors[entry.Materials] || '#7f8c8d';

    for (let i = 0; i < entry['Number of Shirts']; i++) {
      const offset = (i - (entry['Number of Shirts'] - 1) / 2) * 7;
      const topX = cx + offset;
      const topY = shirtY - (i + 1) * 18;
      const topLine = createSVG('line', {
        x1: topX,
        y1: shirtY,
        x2: topX,
        y2: topY,
        stroke: color,
        'stroke-width': 2.1,
        'stroke-linecap': 'round'
      });
      svg.appendChild(topLine);
    }

    const squiggle = drawSquiggleMarker(cx, shirtY, color);
    svg.appendChild(squiggle);

    if (entry['# of Changes'] > 0) {
      for (let i = 0; i < entry['# of Changes']; i++) {
        const changeOffset = (i - (entry['# of Changes'] - 1) / 2) * 8;
        const xStart = cx + changeOffset;
        const yTop = lowerBaseline + 18;
        const changeY = yForChanges(entry['# of Changes']) + i * 8;
        const changeLine = createSVG('line', {
          x1: xStart,
          y1: yTop,
          x2: xStart,
          y2: changeY,
          stroke: '#2d3748',
          'stroke-width': 2,
          'stroke-linecap': 'round'
        });
        svg.appendChild(changeLine);
      }
    }
  });

  const title = createSVG('text', {
    x: margins.left,
    y: 24,
    class: 'axis-label'
  });
  title.textContent = 'Shirts';
  svg.appendChild(title);

  const changesLabel = createSVG('text', {
    x: margins.left + 8,
    y: height - margins.bottom + 18,
    class: 'axis-label'
  });
  changesLabel.textContent = 'Changes';
  svg.appendChild(changesLabel);

  const legendY = height - 30;

  const originalLegendItems = [
    { label: 'Shirts', color: '#2d3748', type: 'line' },
    { label: 'Materials', color: '#4E79A7', type: 'squiggle' },
    { label: 'Changes', color: '#2d3748', type: 'vertical' },
    { label: 'Pants', color: '#2d3748', type: 'triangle' }
  ];

  originalLegendItems.forEach((item, index) => {
    const itemX = 90 + index * 190;

    if (item.type === 'line') {
      const line = createSVG('line', {
        x1: itemX,
        y1: legendY - 10,
        x2: itemX + 48,
        y2: legendY - 10,
        stroke: item.color,
        'stroke-width': 3
      });
      svg.appendChild(line);
    } else if (item.type === 'squiggle') {
      const squiggle = createSVG('path', {
        d: `M ${itemX} ${legendY - 8} Q ${itemX + 12} ${legendY - 20} ${itemX + 24} ${legendY - 8} Q ${itemX + 36} ${legendY + 4} ${itemX + 48} ${legendY - 8}`,
        fill: 'none',
        stroke: item.color,
        'stroke-width': 2.5,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      });
      svg.appendChild(squiggle);
    } else if (item.type === 'vertical') {
      const line = createSVG('line', {
        x1: itemX + 24,
        y1: legendY - 18,
        x2: itemX + 24,
        y2: legendY + 8,
        stroke: item.color,
        'stroke-width': 2
      });
      svg.appendChild(line);
    } else if (item.type === 'triangle') {
      const triangle = createSVG('polygon', {
        points: `${itemX + 24},${legendY - 12} ${itemX + 10},${legendY + 10} ${itemX + 38},${legendY + 10}`,
        fill: '#2d3748',
        stroke: '#2d3748'
      });
      svg.appendChild(triangle);
    }

    const label = createSVG('text', {
      x: itemX + 60,
      y: legendY + 2,
      class: 'legend-label'
    });
    label.textContent = item.label;
    svg.appendChild(label);
  });

  const colorLegendItems = [
    { label: 'Cotton', color: '#4E79A7' },
    { label: 'Wool', color: '#F28E2B' },
    { label: 'Polyester', color: '#59A14F' },
    { label: 'Mixed', color: '#E15759' }
  ];

  colorLegendItems.forEach((item, index) => {
    const itemX = 110 + index * 170;
    const swatch = createSVG('rect', {
      x: itemX,
      y: legendY - 44,
      width: 18,
      height: 18,
      rx: 4,
      fill: item.color
    });
    svg.appendChild(swatch);

    const label = createSVG('text', {
      x: itemX + 30,
      y: legendY - 29,
      class: 'legend-label'
    });
    label.textContent = item.label;
    svg.appendChild(label);
  });

  const pantsLegendY = legendY + 36;
  const pantsLegendItems = [
    { label: 'Cargo = Right', direction: 'right' },
    { label: 'Jeans = Down', direction: 'down' },
    { label: 'Sweatpants = Left', direction: 'left' },
    { label: 'Slacks = Up', direction: 'up' }
  ];

  pantsLegendItems.forEach((item, index) => {
    const itemX = 80 + index * 190;
    const triangle = createSVG('polygon', {
      fill: '#2d3748',
      stroke: '#2d3748'
    });

    if (item.direction === 'right') {
      triangle.setAttribute('points', `${itemX + 18},${pantsLegendY - 10} ${itemX + 2},${pantsLegendY - 22} ${itemX + 2},${pantsLegendY + 2}`);
    } else if (item.direction === 'down') {
      triangle.setAttribute('points', `${itemX + 18},${pantsLegendY + 18} ${itemX + 2},${pantsLegendY + 2} ${itemX + 34},${pantsLegendY + 2}`);
    } else if (item.direction === 'left') {
      triangle.setAttribute('points', `${itemX + 2},${pantsLegendY - 10} ${itemX + 18},${pantsLegendY - 22} ${itemX + 18},${pantsLegendY + 2}`);
    } else if (item.direction === 'up') {
      triangle.setAttribute('points', `${itemX + 18},${pantsLegendY - 22} ${itemX + 2},${pantsLegendY + 2} ${itemX + 34},${pantsLegendY + 2}`);
    }

    svg.appendChild(triangle);

    const label = createSVG('text', {
      x: itemX + 42,
      y: pantsLegendY + 8,
      class: 'legend-label'
    });
    label.textContent = item.label;
    svg.appendChild(label);
  });

  data.forEach((entry, index) => {
    const cx = xPositions[index];
    const shirtY = yForShirts(entry['Number of Shirts']);
    const triangleSize = 12;
    const triangleY = shirtY + 26;
    drawTriangle(cx, triangleY, triangleSize, orientationMap[entry['Type of Pants']] || 'right');
  });
}

async function loadData() {
  try {
    const response = await fetch('data.json');
    if (!response.ok) throw new Error('No json data');
    const json = await response.json();
    render(json);
  } catch (error) {
    render(fallbackData);
  }
}

loadData();
