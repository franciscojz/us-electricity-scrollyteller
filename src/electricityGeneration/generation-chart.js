import {
	scaleLinear,
	scaleLog,
	scaleOrdinal,
	scaleSqrt,
	scaleBand
} from 'd3-scale';
import { select } from 'd3-selection';
// DO NOT REMOVE D3 TRANSITION! IT'S NEEDED!!!
import { transition } from 'd3-transition';
import { axisBottom, axisLeft } from 'd3-axis';
import { schemePaired } from 'd3-scale-chromatic'
import { legendColor } from 'd3-svg-legend';
import { BarChart } from "dc";
// import { render } from 'sass';

const defaults = {
	container: '#chart',
	height: 500,
	margin: {
		top: 30, left: 60, bottom: 60, right: 30,
	},
	width: 500,
};

export default class ElectricityGenerationChart {
	constructor(props) {
		this._init({ ...defaults, ...props });
	}

	_updateProps(props) {
		this.props = { ...this.props, ...props };
		return this.props;
	}

	shiftRight = 20;

	_init(props) {
		const {
			container,
			height,
			legendArray,
			margin,
			xDomain,
			yDomain,
			yearDomain,
			width,
		} = this._updateProps(props);

		/** build svg */
		this.svg = select(container)
			.append('svg')
			.attr('width', width)
			.attr('height', height);

		// this.svg = new BarChart(container)

		// this.svg.width(width).height(height)
		// 	.xAxisLabel("Generation Source")
		// 	.yAxisLabel("Energy Generated (in Million Kilowatthours)")
		// 	.dimension()
		// 	.group()
		// 	.x(scaleBand())
		// 	.xUnits(dc.units.ordinal);

		/** X SCALE & AXIS */
		this.xScale = scaleBand()
			.domain(xDomain)
			.rangeRound([margin.left, width - margin.right])
			.padding(0.3);

		this.xAxis = g => g
			.attr('transform', `translate(${this.shiftRight},${height - margin.bottom})`)
			.call(axisBottom(this.xScale))
			.call(g => g.select('.domain').remove());

		this.svg
			.append('text')
			.attr('transform', `translate(${width / 2} ,${height - margin.bottom / 3})`)
			.style('text-anchor', 'middle')
			.style('font-size', 14)
			.text('Generation Source');

		this.svg.append('g')
			.call(this.xAxis);

		/** Y SCALE & AXIS */
		this.yScale = scaleLinear() // TODO scale Log? may need to remove negative values
			.domain(yDomain)
			.range([height - margin.bottom, margin.top]);

		this.yAxis = g => g
			.attr('transform', `translate(${margin.left + this.shiftRight},0)`)
			.call(axisLeft(this.yScale))
			.call(g => g.select('.domain').remove());

		this.svg.append('g')
			.call(this.yAxis);

		this.svg
			.append('text')
			.attr('transform', 'rotate(-90)')
			.attr('y', margin.left / 10)
			.attr('x', 0 - height / 2)
			.attr('dy', '1em')
			.style('text-anchor', 'middle')
			.style('font-size', 14)
			.text('Electricity Generated (in Million Kilowatthours)');


		// /** COLOR SCALE */
		this.cScale = scaleOrdinal()
			.domain(xDomain)
			.range(schemePaired);

		/** YEAR SCALE & LABEL */
		this.yearScale = scaleLinear()
			.domain(yearDomain)
			.range([0, yearDomain[1] - yearDomain[0]]);

		this.yearLabel = this.svg.append('g')
			.style('font-size', 50)
			.style('opacity', 0.6)
			.attr('transform', `translate(${width - margin.right - 100}, ${margin.top + 40})`)
			.append('text')
			.text(Math.max(yearDomain) || '');

		/** BAR GROUP */
		this.bar = this.svg.append('g')
			.attr('stroke', '#000')
			.attr('stroke-opacity', 0.2);
	}

	render(props) {
		const {
			data,
			duration = 500,
			year,
			yearDomain,
			height,
			margin
		} = this._updateProps(props);

		const yearIndex = year ? Math.floor(this.yearScale(year)) : this.yearScale.range()[0];

		const update = this.bar
			.selectAll('rect')
			.data(data, (d) => {
				return d.source;
			});

		this.yearLabel
			.text(year || yearDomain[0] || '');

		update
			.enter().append('rect')
			.attr("x", d => this.xScale(d.source) + this.shiftRight)
			.attr("width", this.xScale.bandwidth())
			.attr("y", d => this.yScale(d.generation[yearIndex]))
			.attr("height", d => height - margin.bottom - this.yScale(d.generation[yearIndex]))
			.merge(update)
			.transition()
			.duration(duration)
			.attr("x", d => this.xScale(d.source) + this.shiftRight)
			.attr("width", this.xScale.bandwidth())
			.attr("y", d => this.yScale(d.generation[yearIndex]))
			.attr("height", d => height - margin.bottom - this.yScale(d.generation[yearIndex]))
			.attr('fill', d => this.cScale(d.source))
			.attr('opacity', 0.7);

			// TODO add hover functionality

		update.exit().remove();
	}

	resize(props) {
		this.svg.remove();
		this._init(props);
	}
}
