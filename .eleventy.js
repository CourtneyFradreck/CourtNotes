const { DateTime } = require("luxon");

// Site metadata
const siteMetadata = {
    title: "CourtNotes",
    description: "A personal note-taking site.",
    author: "Courtney Fradreck",
    siteUrl: "https://courtnotes.netlify.app"
};

module.exports = function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy("src/assets");
    eleventyConfig.addPassthroughCopy("src/style.css");
    eleventyConfig.addPassthroughCopy("src/individual.css");
    eleventyConfig.addPassthroughCopy("src/wrapped.css");
    eleventyConfig.addPassthroughCopy("src/admin");
    eleventyConfig.addPassthroughCopy("src/admin/config.yml");
    eleventyConfig.addPassthroughCopy({ "_headers": "_headers" });

    eleventyConfig.addFilter("postDate", (dateObj) => {
        return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_MED);
    });

    // Date filter for sitemap
    eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat("yyyy-LL-dd");
  });

    // URL helper to safely join base URL and path
    eleventyConfig.addFilter("absoluteUrl", (path, base) => {
        const baseUrl = (base || siteMetadata.siteUrl).replace(/\/+$/, "");
        const pagePath = path ? (path.startsWith("/") ? path : "/" + path) : "/";
        return baseUrl + pagePath;
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