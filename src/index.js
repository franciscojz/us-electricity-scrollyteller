import * as dotenv from 'dotenv';
import { select, selectAll } from 'd3-selection';
import { get } from 'lodash-es';
// import './scss/style.scss';
import ScrollyTeller from '@ihmeuw/scrollyteller';
import wealthAndHealth from './wealthandhealth/wealth-scrolly-config';
import generation from './electricityGeneration/generation-config';
import gdp from './gdp/gdp-scrolly-config';

console.log('Environment: ' + process.env.ENVIRONMENT + ', Node: ' + process.env.NODE_ENV);

export default class App {
	constructor() {
		let windowHeight = window.innerHeight;
		let windowWidth = window.innerWidth;
		document.getElementById("energy-header").setAttribute("style", "font-family: Lato; margin: 0px; padding-left: 50px; background-color: steelblue; color: white; padding-top: " + (windowHeight / 2) + "px; padding-bottom: "  + ((windowHeight / 2) + 50) + "px; margin-top: -200px");

		document.getElementById("scroll-indicator").setAttribute("style", "font-family: Lato; margin-top: -150px; margin-left: " + windowWidth / 2 + "px; background-color: steelblue; color: white;");

		document.getElementById("energy-footer").setAttribute("style", "font-family: Lato; margin: 0px; padding-left: 50px; background-color: steelblue; color: white; padding-top: 150px; padding-bottom: 150px; margin-top: -100px");

		/** ScrollyTeller */
		const storyConfiguration = {
			/** The id of the <div> that will contain all of the page content */
			appContainerId: 'corona-web-app',
			/** build an array of valid ScrollyTeller section configuration */
			sectionList: [
				generation,
				gdp
				// wealthAndHealth
			],
			/** optional function to receive the current sectionIdentifier,
			 * narrationIndex, narrationId, and narrationClass
			 * when narration blocks are entered */
			onNarrationChangedFunction: ({ narrationClass }) => {
				/** remove .active from all navButtons */
				selectAll('.navButton')
					.classed('active', false);
				/** set navButtons with class narrationClass to .active */
				selectAll(`.navButton.${narrationClass}`)
					.classed('active', true);
			},
		};

		/** create the ScrollyTeller object to validate the config */
		const storyInstance = new ScrollyTeller(storyConfiguration);

		/** parse data and build all HMTL */
		storyInstance.render();

		/** build click handlers for each button to trigger ScrollyTeller.scrollTo()
		 * the appropriate section/narration as defined as DOM data- attributes */
		selectAll('.navButton')
			.on('click', function () {
				const elt = select(this).node();
				storyInstance.scrollTo(
					get(elt, ['dataset', 'section']),
					get(elt, ['dataset', 'narrationtarget']),
				);
			});
	}
}

document.addEventListener('DOMContentLoaded', () => {
	window.app = new App();
});
