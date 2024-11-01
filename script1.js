(() => {
    const width = 500,
          height = 500,
          radius = Math.min(width, height) / 2;

    const svg = d3.select('.d3-Graphs')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    const pie = d3.pie()
        .value(d => d.count);

    if ('csv' === 'csv') {  // CSV is assumed for simplicity
        d3.csv("Database Schema.csv").then(data => {
            const regionCount = {};

            data.forEach(d => {
                regionCount[d.Region] = (regionCount[d.Region] || 0) + 1;
            });

            const pieData = Object.entries(regionCount).map(([region, count]) => {
                return { region, count };
            });

            const arcs = svg.selectAll('.arc')
                .data(pie(pieData))
                .enter().append('g')
                .attr('class', 'arc');

            arcs.append('path')
                .attr('d', arc)
                .attr('fill', d => color(d.data.region));

            arcs.append('text')
                .attr('transform', d => `translate(${arc.centroid(d)})`)
                .attr('dy', '0.35em')
                .text(d => d.data.region)
                .attr('fill', 'black');

            arcs.on('mouseover', (event, d) => {
                d3.select(this).select('text')
                    .text(`${d.data.region}: ${d.data.count}`);
            }).on('mouseout', (event, d) => {
                d3.select(this).select('text')
                    .text(d.data.region);
            });

        }).catch(error => {
            console.error("Error loading the CSV file:", error);
        });
    } else {
        d3.json('Database Schema.csv.json').then(data => {
            // Assume data is processed the same way as CSV with JSON compatible logic
            const regionCount = {};

            const processedData = Array.isArray(data)
                ? data
                : Array.isArray(data.data)
                    ? data.data
                    : Object.values(data);

            processedData.forEach(d => {
                regionCount[d.Region] = (regionCount[d.Region] || 0) + 1;
            });

            const pieData = Object.entries(regionCount).map(([region, count]) => {
                return { region, count };
            });

            const arcs = svg.selectAll('.arc')
                .data(pie(pieData))
                .enter().append('g')
                .attr('class', 'arc');

            arcs.append('path')
                .attr('d', arc)
                .attr('fill', d => color(d.data.region));

            arcs.append('text')
                .attr('transform', d => `translate(${arc.centroid(d)})`)
                .attr('dy', '0.35em')
                .text(d => d.data.region)
                .attr('fill', 'black');

            arcs.on('mouseover', (event, d) => {
                d3.select(this).select('text')
                    .text(`${d.data.region}: ${d.data.count}`);
            }).on('mouseout', (event, d) => {
                d3.select(this).select('text')
                    .text(d.data.region);
            });

        }).catch(error => {
            console.error("Error loading the JSON file:", error);
        });
    }
})();