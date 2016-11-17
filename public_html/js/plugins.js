(function ($, window, document, undefined) {

    function Search(options) {
        this.options = $.extend({}, Search.defaults, options);
        this.$container = $(this.options.Container);
        this.$Searchform = $(this.options.Searchform);
        this.$Input = $(this.options.Input);
        this.$SliderWrap = $(this.options.SliderWrap);
        this.$PaginationWrap = $(this.options.PaginationWrap);
        this.$PaginationWrap.append('<button data-dir="prev">Prev</button><p></p><button data-dir="next">Next</button>').hide();

        this.imageData;
        this.page = 1;
        this.totalpages;
        this.imageId = 0;
        this.events.submit.call(this);
        this.events.click.call(this);
    }

    Search.prototype.Ajax = function (url, searchVal, perPage, page) {
        return $.getJSON(url, {
            tags: searchVal,
            per_page: perPage || 25,
            page: page || 1,
            format: "json"
        });
    };

    Search.prototype.events = {
        submit: function () {
            this.$Searchform.on('submit', $.proxy(function (e) {
                var input = this.$Searchform.find('input:first');
                if (input.val() !== '') {
                    this.options.SearchTerm = input.val();
                }
                this.page = 1;
                this.getJSON();
                e.preventDefault();
            }, this));
        },
        click: function () {
            var self = this;
            this.$PaginationWrap.find('button').on('click', function (e) {
                self.pagenumber($(this).data('dir'));
                self.getJSON();
                e.preventDefault();
            });

            this.$container.find('img').on('click', function (e) {
                self.imageId = $(this).index();
                self.renderslider();
            });
        }
    };

    Search.prototype.pagenumber = function (dir) {
        this.page += (~~(dir === 'next') || -1);
        this.page = (this.page < 1) ? this.totalpages - 1 : this.page % this.totalpages;
    };

    Search.prototype.getJSON = function () {
        ($.proxy(function () {
            $.when(this.Ajax(
                    'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key='
                    + this.options.ApiKey + '&nojsoncallback=1',
                    this.options.SearchTerm,
                    this.options.DisplayItems,
                    this.page
                    )).done($.proxy(function (data) {
                this.imageData = data;
                this.totalpages = data.photos.pages;
                this.rendergrid();
                this.renderslider();
            }, this)).fail($.proxy(function () {
                alert('ups');
            }, this));
        }, this))();
    };


    Search.prototype.renderslider = function () {
        this.$SliderWrap.empty();

        var item = this.imageData.photos.photo[this.imageId];
        var url = 'https://farm'
                + item.farm + '.staticflickr.com/'
                + item.server + '/' + item.id
                + '_' + item.secret + '_z.jpg';
        this.$SliderWrap.append('<img class="item" src="' + url + '"/>');

        this.events.click.call(this);
    };

    Search.prototype.rendergrid = function () {
        this.$container.empty();
        $.each(this.imageData.photos.photo, $.proxy(function (i, item) {
            var url = 'https://farm'
                    + item.farm + '.staticflickr.com/'
                    + item.server + '/' + item.id
                    + '_' + item.secret + this.options.Imagesize + '.jpg';
            this.$container.append('<img class="item" src="' + url + '"/>');
        }, this));

        this.$PaginationWrap.show().find('p').html('Page ' + this.page + ' of ' + this.totalpages);
        this.animate();
    };

    Search.prototype.animate = function () {
        this.$container.children().show().each(function (i) {
            $(this).css({"opacity": 0}).delay((i++) * 20)
                    .animate({
                        opacity: 1
                    }, 400);
        });
    };

    Search.defaults = {
        Container: '#images',
        Searchform: '#Search',
        PaginationWrap: '#pagination',
        SliderWrap: '#slider',
        SearchTerm: 'cats',
        DisplayItems: '25',
        Imagesize: '_q',
        ApiKey: '88c47fa52f889234d0706c9cf74a6a83'
    };

    $.fn.flickr = function (options) {
        return this.each(function () {
            new Search(options);
        });
    };

})(jQuery, window, document);






