module.exports = function(eleventyConfig) {
    eleventyConfig.addPassthroughCopy("src/assets");
    eleventyConfig.addPassthroughCopy("src/style.css");
    eleventyConfig.addPassthroughCopy("src/individual.css");
    eleventyConfig.addPassthroughCopy("src/all-blogs.html");
    eleventyConfig.addPassthroughCopy("src/individual-blog.html");
    return {
        dir: {
            input: "src",
            output: "public"
        }
    };
};