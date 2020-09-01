/* globals jQuery, document */
(function ($) {
    "use strict";

    $(document).ready(function () {
        $("img.lazyload").lazyload();

        $("#nav-drawer").click(function () {
            $('#wrapper').toggleClass("drawer-open");
        });

        let fuse = null;
        const $searchBtn = $('.js-search');
        const $inputSearch = $('.js-input-search');
        const $searchResults = $('.container .content');
        const trySearchFeature = () => {
            if (typeof ghostSearchApiKey !== 'undefined') {
                getAllPosts(ghostHost, ghostSearchApiKey)
            }
        }

        const getAllPosts = (host, key) => {
            const api = new GhostContentAPI({
                url: host,
                key,
                version: 'v2'
            })
            const allPosts = []
            const fuseOptions = {
                shouldSort: true,
                ignoreLocation: true,
                findAllMatches: true,
                includeScore: true,
                minMatchCharLength: 2,
                keys: ['title','custom_excerpt', 'tags.name']
            }

            api.posts.browse({
                limit: 'all',
                include: 'tags',
                fields: 'id, title, url, published_at,custom_excerpt'
            }).then((posts) => {
                for (let i = 0, len = posts.length; i < len; i++) {
                    allPosts.push(posts[i])
                }

                fuse = new Fuse(allPosts, fuseOptions)
            })
            .catch((err) => {
                console.log(err)
            })
        };

        $searchBtn.click(() => {
            search_result();
        });

        $inputSearch.bind('keydown',function(e){
            if(e.keyCode == "13") {
                search_result();
            }
        });


        const search_result = () => {
            let htmlString = '';
            if ($inputSearch.val().length > 0 && fuse) {
                const results = fuse.search($inputSearch.val())
                const bestResults = results.filter((result) => {
                    if (result.score <= 0.5) {
                        return result
                    }
                });

                if (bestResults.length > 0) {
                    for (let i = 0, len = bestResults.length; i < len; i++) {
                        htmlString += `
                        <article class="post">
                            <header class="post-header">
                                <h2 class="post-title"><a href="${bestResults[i].item.url}">${bestResults[i].item.title}</a></h2>
                                <span class="post-meta">
                                    <time datetime="{{date format='YYYY-MM-DD'}}">
                                    <i class="fa fa-calendar-o" aria-hidden="true"></i>${formatDate(bestResults[i].item.published_at)}</time>
                                    <i class="fa fa-tag" aria-hidden="true"></i>${getTags(bestResults[i].item.tags)}&nbsp;
                                </span>
                            </header>
                            <section class="post-excerpt">
                                <p>${bestResults[i].item.custom_excerpt==null ? '':bestResults[i].item.custom_excerpt}&hellip;</p>
                            </section>
                        </article>`
                    }
                    $searchResults.html(htmlString);
                } else {
                    htmlString += `
                        <article class="post">
                             <h4>搜索无结果</h4>
                        </article>`;
                    $searchResults.html(htmlString);
                }

            } else {
                window.location.href = "/";
            }
        };

        const formatDate = (date) => {
            if (date) {
                return new Date(date).toLocaleDateString(
                    document.documentElement.lang,
                    {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }
                )
            }

            return ''
        }

        const getTags = (arr) => {
            if (arr) {
               let _html = ''
                arr.forEach((item, index) => {
                    _html += '<a href="'+item.url+'">'+item.name+'</a>' + "&nbsp;"
                });

               return _html;
            }

            return ''
        }

        /* archive index */
        var titleIdx = $('.post-content h2');
        if (titleIdx.length > 5) {
            var anchor;
            var indexBox = '<div class="archive-index"><ul>';
            for (var i = 0; i < titleIdx.length; i++) {
                if (titleIdx.eq(i).attr('id')) {
                    anchor = titleIdx.eq(i).attr('id');
                } else {
                    anchor = "archive-title-index-" + i
                    titleIdx.eq(i).attr('id').attr('id', anchor);
                }

                indexBox += '<li id="nav-' + anchor + '"><a href="#' + anchor + '">' + titleIdx.eq(i).html().trim() + '</a></li>';
            }
            indexBox += '</ul></div>';
            $('.post-content').prepend(indexBox);
            $('.archive-index li a').on('click', function () {
                var $this = $(this);
                $(document).scrollTop($($this.attr('href')).offset().top - 65);
                return false;
            });

            var curTit;
            var preTit = titleIdx.eq(0);
            $('#nav-' + preTit.attr('id')).addClass('active');

            $(document).on('scroll', function () {

                titleIdx.each(function () {
                    var $this = $(this);
                    if ($(document).scrollTop() > $this.offset().top - 300) {
                        curTit = $this;
                    }

                });

                $('#nav-' + preTit.attr('id')).removeClass('active');
                $('#nav-' + curTit.attr('id')).addClass('active');
                preTit = curTit;
            });


        }

        trySearchFeature();
    });

    $(".backtop .lnk").on("click", function () {
        $(document).scrollTop(0);
        return false;
    });

    $(document).on('scroll', function () {
        if ((document.documentElement.scrollTop || document.body.scrollTop) > 30) {
            $('.site-head').addClass('site-head-fixed');
        } else {
            $('.site-head').removeClass('site-head-fixed');
        }

        if ((document.documentElement.scrollTop || document.body.scrollTop) > 400) {
            $('.backtop').fadeIn(300);
        } else {
            $('.backtop').fadeOut(300);
        }
    })



}(jQuery));

(function ($) {
    var images = document.querySelectorAll('.kg-gallery-image img');
    images.forEach(function (image) {
        var container = image.closest('.kg-gallery-image');
        var width = image.attributes.width.value;
        var height = image.attributes.height.value;
        var ratio = width / height;
        container.style.flex = ratio + ' 1 0%';
    })
}(jQuery));
