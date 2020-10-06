import { isNil } from 'lodash-es'
import { interpolate } from 'd3-interpolate';
import { select } from 'd3-selection';
import { extent } from 'd3-array';
import GDPChart from './gdp-chart';

const handleActivateNarrationAndResize = ({
	graphId,
	state: {
		year,
		snippet,
		highlight,
		svgFileName,
		interactive,
	}, /** destructure "year" variable from state */
	sectionConfig: {
		graph: {
			$codeSnippetSelection,
			gdpSelector,
			gdpGraph,
		},
	}, /** destructure graph from section config */
	width,
	height,
}) => {
	/* Removed code snippets and images, see https://github.com/ihmeuw/ScrollyTeller/blob/master/demo_app/01_wealthAndHealthOfNations/scrollyTellerConfig.js */

	/** HIDE GRAPH WHEN CODE SNIPPETS ARE DISPLAYED */
	/** render a year (year = undefined defaults to min year in component) */
	select(gdpSelector)
		.style('opacity', 1);
	/** handle resize if width/height exist */
	if (width && height) {
		gdpGraph.resize({ width, height });
	} else if (!isNil(year)) {
		gdpGraph.render({
			year: Number(year),
			duration: 1000,
			highlight: highlight,
			interactive: interactive,
		});
	}
}

/** section configuration object with identifier, narration, and data (for the graph)  */
export default {
	/** identifier used to delineate different sections.  Should be unique. */
	sectionIdentifier: 'gdp',
	narration: require('./data/GdpNarration.csv'),
	data: require('./data/energyGdp.json'),
	
	/**
	 * Optional method to reshape the data passed into ScrollyTeller, or resolved by the data promise
	 * @param {object} results - data passed into ScrollyTeller or the result of resolving the data promise (see below).
	 * @returns {object|array} -  an object or array of data of user-defined shape
	 */
	reshapeDataFunction: function processData(results) {
		/** compute data domains for population (radius), income (x), life expectancy (y), and years
		 * These functions compute the data domains [min, max] over a range of years from
		 * 1950 - 2008 so the graph axes don't change as we update */
		const rDomain = extent(results.reduce((acc, d) => (acc.concat(...extent(d["Total Generation"]))), []));
		const xDomain = extent(results.reduce((acc, d) => (acc.concat(...extent(d["CO2 per Unit GDP"]))), []));
		const yDomain = extent(results.reduce((acc, d) =>
			(acc.concat(...extent(d["Share Renewable +"]))), []));
		const yearDomain = extent(results.reduce((acc, d) => (acc.concat(...extent(d.years))), []));

		/** Legend items are regions, so get unique region names */
		const legendArray = results.reduce((acc, d) =>
			(acc.includes(d.region) ? acc : acc.concat(d.region)), []);

		/** return the raw data, domains, and scales, which will be assigned
		 * to sectionConfig.data. The sectionConfig object is received by all scrollyteller
		 * functions such as buildGraphFunction(), onActivateNarrationFunction(), onScrollFunction() */
		return {
			dataArray: results,
			legendArray,
			rDomain,
			xDomain,
			yDomain,
			yearDomain,
		};
	},

	buildGraphFunction: function buildGraph(graphId, sectionConfig) {
		const {
			/** destructure the dataArray and domains computed by reshapeDataFunction() from the sectionConfig */
			data: {
				dataArray,
				legendArray,
				rDomain,
				xDomain,
				yDomain,
				yearDomain,
			},
		} = sectionConfig;

		/** create a css selector to select the graph div by id */
		const graphSelector = `#${graphId}`;

		/** create a div to render images */
		select(`#${graphId}`)
			.append('div')
			.classed('imageDiv', true);

		/** build the wealth and health graph */
		const gdpGraph = new GDPChart({
			container: graphSelector,
			/** data */
			data: dataArray,
			/** data domains */
			rDomain,
			xDomain,
			yDomain,
			yearDomain,
			/** legend values */
			legendArray,
			/** dimensions */
			height: select(graphSelector).node().offsetHeight * 0.9,
			width: select(graphSelector).node().offsetWidth * 0.9,
		});
		
		/** create a div to render code snippets */
		const $codeSnippetSelection = select(graphSelector)
			.append('div')
			.attr('id', 'codeSnippet');

		/** REMEMBER TO RETURN THE GRAPH! (could also return as an object with multiple graphs, etc) */
		return {
			$codeSnippetSelection,
			gdpSelector: `#${graphId} svg`,
			gdpGraph,
		};
	},

	onScrollFunction: function onScroll({
		progress,
		state: {
			yearDomain,
			highlight,
			interactive,
		}, /** destructure year progress variable set from the narration.csv file */
		sectionConfig: {
			graph: {
				snippet,
				svgFileName,
				gdpGraph,
				gdpSelector,
			}, /** destructure graph from section config */
		},
	}) {
		if (snippet || svgFileName) {
			select(gdpSelector).style('opacity', 0);
		} else if (!isNil(yearDomain)) {
			const interpolateYear = interpolate(...yearDomain)(progress);
			gdpGraph.render({
				year: Math.floor(interpolateYear),
				duration: 100,
				highlight: highlight,
				interactive: interactive,
			});
		}
	},

	onActivateNarrationFunction: handleActivateNarrationAndResize,

	onResizeFunction: function onResize({
		graphElement,
		...rest
	}) {
		handleActivateNarrationAndResize({
			...rest,
			graphElement,
			width: graphElement.offsetWidth * 0.9,
			height: graphElement.offsetHeight * 0.9,
		});
	},
};