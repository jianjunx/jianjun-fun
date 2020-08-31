(function ($) {
  // Search
  var $searchWrap = $("#search-form-wrap"),
    isSearchAnim = false,
    searchAnimDuration = 200;

  var startSearchAnim = function () {
    isSearchAnim = true;
  };

  var stopSearchAnim = function (callback) {
    setTimeout(function () {
      isSearchAnim = false;
      callback && callback();
    }, searchAnimDuration);
  };

  // $('#nav-search-btn').on('click', function () {
  //   if (isSearchAnim) return;

  //   startSearchAnim();
  //   $searchWrap.addClass('on');
  //   stopSearchAnim(function () {
  //     $('.search-form-input').focus();
  //   });
  // });

  $(".search-form-input").on("blur", function () {
    startSearchAnim();
    $searchWrap.removeClass("on");
    stopSearchAnim();
  });

  // Share
  $("body")
    .on("click", function () {
      $(".article-share-box.on").removeClass("on");
    })
    .on("click", ".article-share-link", function (e) {
      e.stopPropagation();

      var $this = $(this),
        url = $this.attr("data-url"),
        encodedUrl = encodeURIComponent(url),
        id = "article-share-box-" + $this.attr("data-id"),
        offset = $this.offset();

      if ($("#" + id).length) {
        var box = $("#" + id);

        if (box.hasClass("on")) {
          box.removeClass("on");
          return;
        }
      } else {
        var html = [
          '<div id="' + id + '" class="article-share-box">',
          '<input class="article-share-input" value="' + url + '">',
          '<div class="article-share-links">',
          '<a href="https://twitter.com/intent/tweet?url=' +
            encodedUrl +
            '" class="article-share-twitter" target="_blank" title="Twitter"></a>',
          '<a href="https://www.facebook.com/sharer.php?u=' +
            encodedUrl +
            '" class="article-share-facebook" target="_blank" title="Facebook"></a>',
          '<a href="http://pinterest.com/pin/create/button/?url=' +
            encodedUrl +
            '" class="article-share-pinterest" target="_blank" title="Pinterest"></a>',
          '<a href="https://plus.google.com/share?url=' +
            encodedUrl +
            '" class="article-share-google" target="_blank" title="Google+"></a>',
          "</div>",
          "</div>",
        ].join("");

        var box = $(html);

        $("body").append(box);
      }

      $(".article-share-box.on").hide();

      box
        .css({
          top: offset.top + 25,
          left: offset.left,
        })
        .addClass("on");
    })
    .on("click", ".article-share-box", function (e) {
      e.stopPropagation();
    })
    .on("click", ".article-share-box-input", function () {
      $(this).select();
    })
    .on("click", ".article-share-box-link", function (e) {
      e.preventDefault();
      e.stopPropagation();

      window.open(
        this.href,
        "article-share-box-window-" + Date.now(),
        "width=500,height=450"
      );
    });

  // Caption
  $(".article-entry").each(function (i) {
    $(this)
      .find("img")
      .each(function () {
        if ($(this).parent().hasClass("fancybox")) return;

        var alt = this.alt;

        if (alt) $(this).after('<span class="caption">' + alt + "</span>");

        $(this).wrap(
          '<a href="' + this.src + '" title="' + alt + '" class="fancybox"></a>'
        );
      });

    $(this)
      .find(".fancybox")
      .each(function () {
        $(this).attr("rel", "article" + i);
      });
  });

  if ($.fancybox) {
    $(".fancybox").fancybox();
  }

  // Mobile nav
  var $container = $("#container"),
    isMobileNavAnim = false,
    mobileNavAnimDuration = 200;

  var startMobileNavAnim = function () {
    isMobileNavAnim = true;
  };

  var stopMobileNavAnim = function () {
    setTimeout(function () {
      isMobileNavAnim = false;
    }, mobileNavAnimDuration);
  };

  $("#main-nav-toggle").on("click", function () {
    if (isMobileNavAnim) return;

    startMobileNavAnim();
    $container.toggleClass("mobile-nav-on");
    stopMobileNavAnim();
  });

  $("#wrap").on("click", function () {
    if (isMobileNavAnim || !$container.hasClass("mobile-nav-on")) return;

    $container.removeClass("mobile-nav-on");
  });

  // search
  (function () {
    var settings = {
      url: "/search.json",
      method: "GET",
      timeout: 0,
    };
    $(document).bind("click", function (e) {
      //id为menu的是菜单，id为open的是打开菜单的按钮
      if (!$(e.target).parents("#search-form-wrap").length > 0) {
        $(".search-drop").hide();
      }
    });
    $.ajax(settings).done(function (response) {
      var searDrop = $(".search-drop");
      var timer = null;
      $(".search-input").on("input", function (event) {
        var value = event.target.value;
        if (value.length < 2) return;
        clearTimeout(timer);
        timer = setTimeout(function () {
          var resEles = [];
          for (var index = 0; index < response.length; index++) {
            var item = response[index];
            var reg = RegExp(value);
            if (reg.test(item.title) || reg.test(item.content)) {
              var title = item.title.replace(reg, function (match, args) {
                return `<span class="search-color">${match}</span>`;
              });
              var _content = reg.exec(item.content);
              if (Array.isArray(_content)) {
                var content = getContent(
                  _content[0],
                  _content["index"],
                  item.content.replace(/\n/g, "")
                );
              }
              resEles.push(
                `<a href="${item.url}"><h3>${title}</h3><p>${content}</p></a>`
              );
            }
          }
          if (resEles.length > 0) {
            searDrop.show();
            searDrop.html(resEles.join(""));
          } else {
            searDrop.hide();
          }
        }, 300);
      });
    });
    function getContent(target, indexof, content) {
      var max = 46,
        t_len = target.length;
      var res = content.slice(indexof, max - t_len);
      var r_len = res.length;
      if (r_len < max) {
        var n_len = max - r_len;
        var last_content = content.slice(0, indexof);
        var last_len = last_content.length;
        if (last_len < n_len) {
          res = last_content + res;
        } else {
          res = last_content.slice(last_len - n_len);
        }
      }
      return (
        res.replace(target, `<span class="search-color">${target}</span>`) +
        "..."
      );
    }
  })();

  // header添加current
  (function () {
    var mainNavs = $("#main-nav").children(".nav_link_flag");

    for (let nav = 0; nav < mainNavs.length; nav++) {
      const mainNav = mainNavs[nav];
      var pathname = location.pathname;
      if (location.pathname != "/") pathname = pathname.slice(0, -1);
      var $manNav = $(mainNav);
      if ($manNav.attr("href") == pathname) $manNav.addClass("nav-active");
    }
  })();

  // tag cloude
  (function () {
    var tagCloud = $(".tags-list").children("a");
    var maxSize = 0;
    var tagItemArr = [];
    for (let tag = 0; tag < tagCloud.length; tag++) {
      var tagItem = $(tagCloud[tag]);
      var oldSize = tagItem.css("font-size").slice(0, -2);
      if (oldSize > maxSize) maxSize = oldSize;
      tagItemArr.push({
        ele: tagItem,
        size: oldSize,
      });
    }
    tagItemArr.forEach(function (v) {
      v.ele.css("font-size", v.size * 1.5);
      v.ele.css("opacity", v.size / maxSize);
    });
  })();
  function setTop() {
    const body = $("html,body");
    return function (top) {
      body.animate(
        {
          scrollTop: top,
          screenLeft: top,
        },
        400
      );
    };
  }
  function getTitles() {
    const titles = $(
      ".article-entry h1,.article-entry h2,.article-entry h3,.article-entry h4,.article-entry h5,.article-entry h6"
    );
    const eles = [];
    for (let i = 0; i < titles.length; i++) {
      const cur = titles[i];
      const next = titles[i + 1];
      const param = { id: cur.id };
      const top = $(cur).offset().top - 80;
      param.min = i === 0 ? 0 : top;
      param.max = next ? $(next).offset().top - 80 : 99999;
      eles.push(param);
    }
    return eles;
  }
  const scrollDeps = [];
  (function () {
    const WINDOW = $(window);
    document.addEventListener("scroll", function (e) {
      scrollDeps.forEach((fn) => fn(WINDOW.scrollTop(), e));
    });
  })();
  // 处理toc
  (function () {
    const TOC_SRC = document.querySelector("#toc-src");
    if (!TOC_SRC) return;
    const TOC = $("#toc");
    const TO_TOP = $(".to-top");
    const setTopHandler = setTop();
    TOC.append(TOC_SRC);
    TOC.show();
    TOC.css("width", $("#sidebar").width() + "px");
    TO_TOP.on("click", function () {
      setTopHandler(0);
    });
    $("#toc-src").on("click", "a", function (e) {
      const href = $(e.target).parent().attr("href");
      setTopHandler($(decodeURI(href)).offset().top - 70);
      return false;
    });

    const top = TOC.offset().top;
    const titles = getTitles();
    scrollDeps.push((wtop) => {
      const tocTop = top - wtop;
      setTocActive(titles, wtop);

      if (wtop > 200) {
        TO_TOP.show();
      } else {
        TO_TOP.hide();
      }
      if (tocTop < 75) {
        if (TOC.hasClass("toc-fixed")) return;
        TOC.addClass("toc-fixed");
      } else {
        if (!TOC.hasClass("toc-fixed")) return;
        TOC.removeClass("toc-fixed");
      }
    });
  })();
  function setTocActive(list, top) {
    for (const { id, max, min } of list) {
      if (top > min && top <= max) {
        $(`a[href="#${encodeURI(id)}"]`).addClass("toc-active");
      } else {
        $(`a[href="#${encodeURI(id)}"]`).removeClass("toc-active");
      }
    }
  }
  // header隐藏逻辑
  (function () {
    const getDirection = scrollDirection();
    const header = $("#header");
    const toc = document.querySelector("#toc");
    let flag = false;
    scrollDeps.push((wtop, e) => {
      const d = getDirection(wtop);
      if (d === "top" && !flag) {
        flag = true;
        header.animate({ top: "10px" }, 300);
        if (toc) toc.style.top = "70px";
        setTimeout(() => (flag = false), 300);
      }
      if (d === "down" && !flag) {
        flag = true;
        header.animate({ top: "-80px" }, 300);
        if (toc) toc.style.top = "0";
        setTimeout(() => (flag = false), 300);
      }
    });
  })();
  function scrollDirection() {
    let old = 0;
    return function (wtop) {
      if (wtop === old) return;
      const direction = wtop < old ? "top" : "down";
      old = wtop;
      return direction;
    };
  }
})(jQuery);
