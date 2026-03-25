module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy({"static": "."});
  eleventyConfig.addWatchTarget("static/assets/css/");
  eleventyConfig.addWatchTarget("static/assets/js/");

  eleventyConfig.addFilter("split", function(value, separator) {
    if (!value) return [];
    return value.split(separator).map(s => s.trim()).filter(s => s);
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["njk", "html", "md"],
    htmlTemplateEngine: "njk"
  };
};
