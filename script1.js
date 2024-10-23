(()=>{
    const width = 800;
    const height = 600;
    const margin = {top: 20, right: 30, bottom: 50, left: 70};

    const svg = d3.select('.d3-Graphs')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const tooltip = d3.select('.d3-Graphs')
        .append('div')
        .style('position', 'absolute')
        .style('background-color', 'white')
        .style('border', 'solid')
        .style('border-width', '1px')
        .style('border-radius', '5px')
        .style('padding', '10px')
        .style('display', 'none')
        .style('color', 'black');

    d3.csv("loan_data_set.csv").then(data => {
        data.forEach(d => {
            d.LoanAmount = +d.LoanAmount;
            d.ApplicantIncome = +d.ApplicantIncome;
        });

        const x = d3.scaleBand()
            .domain(data.map(d => d.Education))
            .range([0, width - margin.left - margin.right])
            .padding(0.2);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.LoanAmount || 0)])
            .range([height - margin.top - margin.bottom, 0]);

        svg.append('g')
            .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
            .call(d3.axisBottom(x));

        svg.append('g')
            .call(d3.axisLeft(y));

        svg.selectAll('.bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.Education))
            .attr('y', d => y(d.LoanAmount || 0))
            .attr('width', x.bandwidth())
            .attr('height', d => height - margin.top - margin.bottom - y(d.LoanAmount || 0))
            .on('mouseover', function(event, d) {
                tooltip.style('display', 'block');
                tooltip.html(`Education: ${d.Education}<br>Loan Amount: ${d.LoanAmount}`)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 25) + 'px');
            })
            .on('mousemove', function(event) {
                tooltip.style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 25) + 'px');
            })
            .on('mouseleave', function() {
                tooltip.style('display', 'none');
            });

        svg.append('text')
            .attr('transform', `translate(${(width - margin.left - margin.right) / 2}, ${height - margin.bottom})`)
            .style('text-anchor', 'middle')
            .text('Education');

        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - margin.left)
            .attr('x', 0 - (height / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .text('Loan Amount');

    }).catch(error => {
        console.error("Error loading the CSV file:", error);
    });
})()