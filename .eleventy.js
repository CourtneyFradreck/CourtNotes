const { DateTime } = require("luxon");

// Site metadata
const siteMetadata = {
    title: "CourtNotes",
    description: "A personal note-taking site.",
    author: "Courtney Fradreck",
    siteUrl: "https://courtnotes.netlify.app"
};

module.exports = function(eleventyConfig) {
    eleventyConfig.addPassthroughCopy("src/assets");
    eleventyConfig.addPassthroughCopy("src/style.css");
    eleventyConfig.addPassthroughCopy("src/individual.css");
    eleventyConfig.addPassthroughCopy("src/admin");
    eleventyConfig.addPassthroughCopy("src/admin/config.yml");
    eleventyConfig.addPassthroughCopy("_headers");
    eleventyConfig.addFilter("postDate", (dateObj) => {
        return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_MED);
    });
    eleventyConfig.addCollection("featured", function (collectionApi) {
        return collectionApi.getFilteredByTag("featured");
    });


    // Make site metadata available in templates
    eleventyConfig.addGlobalData("site", siteMetadata);

    return {
        dir: {
            input: "src",
            includes: "_includes",
            output: "public"
        }
    };
};