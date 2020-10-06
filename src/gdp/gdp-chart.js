import {
	scaleLinear,
	scaleLog,
	scaleOrdinal,
	scaleSqrt,
} from 'd3-scale';
import {
	format
} from 'd3-format';
import { select, event } from 'd3-selection';
// DO NOT REMOVE D3 TRANSITION! IT'S NEEDED!!!
import { transition } from 'd3-transition';
import { axisBottom, axisLeft } from 'd3-axis';
import { schemeCategory10 } from 'd3-scale-chromatic'
import { legendColor } from 'd3-svg-legend';

const defaults = {
	container: '#chart',
	height: 500,
	margin: {
		top: 30, left: 60, bottom: 60, right: 30,
	},
	width: 500,
};

var commaFormat = format(",")
var numberFormat = format(",.2f")

export default class GDPChart {
	constructor(props) {
		this._init({ ...defaults, ...props });
	}

	_updateProps(props) {
		this.props = { ...this.props, ...props };
		return this.props;
	}

	_init(props) {
		const {
			container,
			height,
			legendArray,
			margin,
			rDomain,
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

		/** X SCALE & AXIS */

		this.xScale = scaleLinear()
			.domain(xDomain)
			.range([margin.left, width - margin.right]);
		// console.log(xDomain, this.xScale)

		this.xAxis = g => g
			.attr('transform', `translate(0,${height - margin.bottom})`)
			.call(axisBottom(this.xScale)
				.tickFormat(format(""))
				.ticks(width / 100, ','))
			.call(g => g.select('.domain').remove());

		this.svg
			.append('text')
			.attr('transform', `translate(${width / 2} ,${height - margin.bottom / 2})`)
			.style('text-anchor', 'middle')
			.style('font-size', 14)
			.text('Carbon Intensity (Metric Tons CO2 per 1 Million Dollars GDP)');

		this.svg.append('g')
			.call(this.xAxis);

		this.yScale = scaleLinear()
			.domain(yDomain)
			.range([height - margin.bottom, margin.top]);

		/** Y SCALE & AXIS */
		this.yAxis = g => g
			.attr('transform', `translate(${margin.left},0)`)
			.call(axisLeft(this.yScale))
			.call(g => g.select('.domain').remove());

		this.svg.append('g')
			.call(this.yAxis);

		this.svg
			.append('text')
			.attr('transform', 'rotate(-90)')
			.attr('y', margin.left / 3)
			.attr('x', 0 - height / 2)
			.attr('dy', '1em')
			.style('text-anchor', 'middle')
			.style('font-size', 14)
			.text('Share of Carbon-Free Energy Sources');

		/** RADIUS SCALE */
		this.rScale = scaleSqrt()
			.domain(rDomain)
			.range([1, 50]);

		/** COLOR SCALE */
		this.cScale = scaleOrdinal()
			.domain(legendArray)
			.range(schemeCategory10);

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

		/** SCATTER GROUP */
		this.scatter = this.svg.append('g')
			.attr('stroke', '#000')
			.attr('stroke-opacity', 0.2);

		/** LEGEND */
		this.svg.append('g')
			.attr('class', 'legendOrdinal')
			.style('font-size', 13)
			.style('opacity', 0.7)
			.attr('transform', `translate(${width - width / 4 - 10}, ${margin.top + 60})`);

		const legendOrdinal = legendColor()
			.shape('circle')
			.shapeRadius(8)
			.title('Regions')
			.titleWidth(100)
			.scale(this.cScale);

		this.svg.select('.legendOrdinal').call(legendOrdinal);
	}

	selectedState = "";

	render(props) {
		const {
			data,
			duration = 500,
			year,
			yearDomain,
			highlight,
			interactive,
		} = this._updateProps(props);

		const yearIndex = year ? Math.floor(this.yearScale(year)) : this.yearScale.range()[0];

		const update = this.scatter
			.selectAll('circle')
			.data(data, (d) => {
				return d.name;
			});

		this.yearLabel
			.text(year || yearDomain[0] || '');

		var div = select("body").append("div")
			.style("position", "absolute")
			.style("z-index", "10")
			.style("text-align", "center")
			.style("width", "80px")
			.style("height", "30px")
			.style("padding", "2px")
			.style("font", "12px sans-serif")
			.style("background-color", "lightsteelblue")
			.style("border", "0px")
			.style("border-radius", "8px")
			.style("pointer-events", "none")
			.style("opacity", 0);

		let isStateHighlighted = (data) => {
			let isStateInArray = false;
			if (highlight && highlight.length > 0) {

				highlight.forEach((highlightedState) => {
					if (highlightedState === data.name) {
						isStateInArray = true;
					}
				})
			}
			return isStateInArray;
		};

		let bubbleOpacity = (data) => {
			if (highlight && highlight.length > 0) {
				if (isStateHighlighted(data)) {
					return 0.7;
				} else {
					return 0.2;
				}
			} else if (interactive && this.selectedState !== "") {
				if (this.selectedState === data.name) {
					return 0.7;
				} else {
					return 0.2;
				}
			} else {
				return 0.7;
			}
		}

		update
			.enter().append('circle')
			.attr('cx', d => this.xScale(d["CO2 per Unit GDP"][yearIndex]))
			.attr('cy', d => this.yScale(d["Share Renewable +"][yearIndex]))
			// .attr('opacity', d => isStateHighlighted(d) ? 0.7 : 0.2)
			.merge(update)

		update.transition()
			.duration(duration)
			.attr('cx', d => this.xScale(d["CO2 per Unit GDP"][yearIndex]))
			.attr('cy', d => this.yScale(d["Share Renewable +"][yearIndex]))
			.attr('fill', d => this.cScale(d.region))
			// .attr('opacity', d => ((!highlight || highlight.length === 0) || (interactive &&selectedState === "")) ? 0.7 : (isStateHighlighted(d)) ? 0.7 : (selectedState !== "" && selectedState === d.name)) ? 0.7 : 0.2)
			.attr('opacity', d => bubbleOpacity(d))
			.attr('r', d => this.rScale(d["Total Generation"][yearIndex]))

		update
			.on("mouseover", d => {
				div.transition()
					.duration(200)
					.style("opacity", .9);
				div.html(d.name + "<br/>" + commaFormat(d["Total Generation"][yearIndex]))
					.style("left", (event.pageX) + "px")
					.style("top", (event.pageY - 28) + "px");
			})
			.on("mouseout", d => {
				div.transition()
					.duration(500)
					.style("opacity", 0);
			})
			.on("click", d => {
				if (interactive) {
					if (this.selectedState === d.name) {
						this.selectedState = "";
						update
							.transition()
							.attr('opacity', cir => 0.7)
					} else {
						this.selectedState = d.name;
						update
							.transition()
							.attr('opacity', cir => {
								return cir.name === this.selectedState ? 0.7 : 0.2;
							})
					}
				}
			})

		window.addEventListener('scroll', (e) => {
			div.transition()
				.duration(200)
				.style("opacity", 0);
		});

		update.exit().remove();
	}

	resize(props) {
		this.svg.remove();
		this._init(props);

	}
}
