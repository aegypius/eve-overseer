(function ($, undefined) {

  $(document)
    .on('click.data-api', '[data-toggle="popover"]', function (evt) {
      evt.stopPropagation();
      var $this = $(this);
      if (undefined === $this.data('bs.popover')) {
        $this.popover('show');
      }
      if (true === $this.data('exclusive')) {
        $('[data-toggle="popover"]').not($this).each(function () {
          $(this).popover('hide');
        });
      }
    })
    .on('click', function() {
      $('[data-toggle="popover"]').popover('hide');
    })
  ;
})(jQuery);
