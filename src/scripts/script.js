document.addEventListener('alpine:init', () => {
  Alpine.data('page', () => ({
    expanded: false,
    articleBodyScrollHeight: undefined,
    percentageOfHeaderRemaining: 1,
    percentageOfHeaderNotOnScreenString: '0%',
    headerTransformString: `translateY(0%)`,

    createTranslateYString(percentageString) {
      `translateY(${percentageString})`;
    },

    scrollToFirst() {
      this.$event.preventDefault();
      const firstSection = document.getElementById('employment');
      this.$root.scrollTo({
        left: undefined,
        top: firstSection.offsetTop,
        behavior: 'smooth',
      });
    },
    handleScroll() {
      if (window.innerWidth > 640) {
        const yScrollPos = this.$event.target.scrollTop;

        const bottomOfHeaderPos =
          this.$refs.header.offsetTop + this.$refs.header.offsetHeight;

        const pixelsRemaining = bottomOfHeaderPos - yScrollPos;

        const percentage = Math.max(
          pixelsRemaining / bottomOfHeaderPos,
          0,
        ).toFixed(2);
        const percentageOfHeaderRemaining = parseFloat(percentage);

        this.percentageOfHeaderRemaining = percentageOfHeaderRemaining;

        const percentageOfHeaderNotOnScreenString = `${
          (1 - percentageOfHeaderRemaining) * 100
        }%`;

        this.percentageOfHeaderNotOnScreenString =
          percentageOfHeaderNotOnScreenString;

        this.headerTransformString = `translateY(${percentageOfHeaderNotOnScreenString})`;
      }
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
