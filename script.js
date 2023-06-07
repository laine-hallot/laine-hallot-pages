document.addEventListener('alpine:init', () => {
  Alpine.data('page', () => ({
    expanded: false,
    articleBodyScrollHeight: undefined,

    scrollToFirst() {
      const firstSection = document.getElementById('first');
      firstSection;
    },
    handleScroll() {
      //console.log($event);
    },
  }));

  Alpine.data('article', () => ({
    expanded: false,
    articleBodyScrollHeight: undefined,

    toggle() {
      this.expanded = !this.expanded;
      this.articleBodyScrollHeight = this.expanded
        ? `${this.$refs.articleBody.scrollHeight}px`
        : undefined;
    },
  }));
});
