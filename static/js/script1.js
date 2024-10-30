(() => {
    // Calculate responsive dimensions
    const margin = {top: 40, right: 40, bottom: 60, left: 60};
    const width = window.innerWidth * 0.8;
    const height = window.innerHeight * 0.7;

    // Select the target div and create responsive SVG
    const svg = d3.select('.d3-Graphs')
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

    // Add responsive behavior
    window.addEventListener('resize', () => {
        const newWidth = window.innerWidth * 0.8;
        const newHeight = window.innerHeight * 0.7;
        svg.attr('viewBox', `0 0 ${newWidth} ${newHeight}`);
    });

    // Load data from CSV
    const dataUrl = 'loan_data_set.csv';
    d3.csv(dataUrl).then(data => {
        data.forEach(d => {
            d.ApplicantIncome = +d.ApplicantIncome;
        });

        const x = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.ApplicantIncome)])
            .range([margin.left, width - margin.right]);

        const y = d3.scaleLinear()
            .range([height - margin.bottom, margin.top]);

        const xAxis = g => g
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x));

        const yAxis = g => g
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));

        svg.append('g')
            .append("text")
            .attr("x", width / 2)
            .attr("y", margin.top - 20)
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .style("text-decoration", "underline")
            .text("Scatterplot of Applicant Income");

        svg.append('g').call(xAxis);
        svg.append('g').call(yAxis);

        const tooltip = d3.select('.d3-Graphs').append('div')
            .style('position', 'absolute')
            .style('visibility', 'hidden')
            .style('background', '#fff')
            .style('border', '1px solid #ccc')
            .style('padding', '5px')
            .style('border-radius', '5px')
            .style('color', 'black');

        svg.append('g')
            .selectAll("circle")
            .data(data)
            .join("circle")
            .attr("cx", d => x(d.ApplicantIncome))
            .attr("cy", d => y(0)) // y value set to 0 for alignment
            .attr("r", 5)
            .style("fill", "steelblue")
            .on("mouseover", (event, d) => {
                tooltip.style('visibility', 'visible')
                    .html(`Applicant Income: ${d.ApplicantIncome}`)
                    .style('left', (event.pageX + 5) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on("mousemove", event => {
                tooltip.style("left", (event.pageX + 5) + 'px')
                    .style("top", (event.pageY - 28) + 'px');
            })
            .on("mouseout", () => tooltip.style('visibility', 'hidden'));

    }).catch(error => {
        console.error('Error loading the CSV file:', error);
    });
})();