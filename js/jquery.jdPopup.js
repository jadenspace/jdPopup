function JdPopup(selector, options) {
    this.layerEl = selector;
    this.$layer = $(selector);
    this._originOptions = options;
    this._options = null;
    this.initOptions(options || {});
    this.constructor._polyfill();
    this.event();
}

JdPopup.prototype.initOptions = function (options) {
    this._options = this._originOptions =  {
        delegateTarget: options.delegateTarget || document,
        closeEl: options.closeEl || '.btn-close',
        dimmedEl: options.dimmedEl || '.dimmed',
        containerEl: options.containerEl || '.layout',
        chainAttr: options.chainAttr || 'data-layer-id',
        setClass: options.setClass || 'on',
        scrollTopDataAttr: options.scrollTopDataAttr || 'st',
        isDimmed: options.isDimmed || false,
        isFixed: options.isFixed || false,
        onStart: options.onStart || function () {},
        onEnd: options.onEnd || function () {},
        offStart: options.offStart || function () {},
        offEnd: options.offEnd || function () {},
        turningPoint: options.turningPoint || 768,
        responsive: options.responsive || {},
        innerEl: options.innerEl || '.layer-pop-inner',
        scrollTopAttr: options.scrollTopAttr || 'data-st',
        a11z: options.a11z || false,
    };
};
JdPopup.cssExtract = function cssExtract(layerId) {
    var computed = window.getComputedStyle ? window.getComputedStyle(document.getElementById(layerId), null) : document.getElementById(layerId).style;
    return parseFloat(computed.transitionDuration) || parseFloat(computed.webkitTransitionDuration);
};
JdPopup._polyfill = function _polyfill() {
    if (!Function.prototype.bind) {
        Function.prototype.bind = function (oThis) {
            if (typeof this !== 'function') {
                throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
            }
            var aArgs = Array.prototype.slice.call(arguments, 1),
                fToBind = this,
                fNOP = function () {
                },
                fBound = function () {
                    return fToBind.apply(this instanceof fNOP
                        ? this
                        : oThis,
                        aArgs.concat(Array.prototype.slice.call(arguments)));
                };
            if (this.prototype) {
                fNOP.prototype = this.prototype;
            }
            fBound.prototype = new fNOP();

            return fBound;
        };
    }
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (searchElement, fromIndex) {
            var k;
            if (this === null) {
                throw new TypeError('"this" is null or not defined');
            }
            var o = Object(this);
            var len = o.length >>> 0;
            if (len === 0) {
                return -1;
            }
            var n = fromIndex | 0;
            if (n >= len) {
                return -1;
            }
            k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
            while (k < len) {
                if (k in o && o[k] === searchElement) {
                    return k;
                }
                k++;
            }
            return -1;
        };
    }
};
JdPopup.prototype.init = function () {
    var self = this;
    this.$layer.filter('.' + this._options.setClass).each(function () {
        self.off(this.id);
        self.containerFixed(this.id, false);
    });
};
JdPopup.prototype.on = function (layerId) {
    var $thisBtn = $('[' + this._options.chainAttr + '="' + layerId + '"]'),
        $thisLayer = $('#' + layerId),
        $dimmed = $(this._options.dimmedEl);

    $thisBtn.addClass(this._options.setClass);
    $thisLayer.addClass(this._options.setClass);
    if (this._options.isDimmed) {
        $dimmed.addClass(this._options.setClass);
    }
};
JdPopup.prototype.off = function (layerId) {
    var $thisBtn = $('[' + this._options.chainAttr + '="' + layerId + '"]'),
        $thisLayer = $('#' + layerId),
        $dimmed = $(this._options.dimmedEl);

    $thisBtn.removeClass(this._options.setClass);
    $thisLayer.removeClass(this._options.setClass);
    if (this._options.isDimmed) {
        $dimmed.removeClass(this._options.setClass);
    }
};
JdPopup.prototype.start = function (layerId, isOn) {
    this.containerFixed(layerId, isOn);
    if (isOn) {
        this._options.onStart();
    } else {
        this._options.offStart();
    }
};
JdPopup.prototype.complete = function (layerId, isOn) {
    var self = this;

    function completeFn() {
        if (isOn) {
            this._options.onEnd();
        } else {
            this._options.offEnd();
        }
    }

    if (this.constructor.cssExtract(layerId)) {
        this.$layer.one('transitionend.complete webkitTransitionend.complete', completeFn.bind(self));
    } else {
        setTimeout(function () {
            completeFn.call(self);
        });
    }
};
JdPopup.prototype.containerFixed = function (layerId, isOn) {
    var $htmlBody = $('html,body'),
        $container = $(this._options.containerEl),
        $layerThis = $('#' + layerId);

    function transitionInit() {
        setTimeout(function () {
            $layerThis.css({
                webkitTransition: '',
                transition: ''
            });
        });
    }

    function layerInit() {
        $layerThis.css({
            position: '',
            top: '',
            left: '',
            webkitTransform: '',
            msTransform: '',
            transform: '',
            webkitTransition: 'none',
            transition: 'none'
        });
        transitionInit();
    }

    function layerTop(positionVal) {
        $layerThis.css({
            position: positionVal || '',
            top: 0,
            left: '50%',
            webkitTransform: 'translate3d(-50%, 0, 0)',
            msTransform: 'translate(-50%, 0)',
            transform: 'translate3d(-50%, 0, 0)',
            webkitTransition: 'none',
            transition: 'none'
        });
        transitionInit();
    }

    function allInit() {
        $htmlBody.css({
            overflowY: '',
            height: ''
        });
        $container.css({
            position: '',
            top: '',
            left: '',
            right: '',
            marginTop: ''
        });
        layerInit();
    }

    if (this._options.isFixed) {
        if (isOn) {
            // note: 레이어팝업 열려있는 경우
            if ($container.data(this._options.scrollTopDataAttr) === undefined) {
                $container.data(this._options.scrollTopDataAttr, window.pageYOffset);
            }
            if (document.getElementById(layerId).clientHeight >= window.innerHeight) {
                // note: 레이어팝업 높이가 뷰사이즈보다 길거나 같은 경우
                /**
                 * 컨테이너를 fixed 시키고, 현재 스크롤 위치만큼 컨테이너를 올려서 보이는 위치가 같게 한다.
                 * html,body 에는 별도 값을 제외시키고(초기화)
                 * 노출된 레이어팝업을 높이를 가질 수 있게 수정한다.
                 * 상단이 맨 위에 붙도록 조절한다.
                 */
                $htmlBody.css({
                    overflowY: '',
                    height: $layerThis.outerHeight(true)
                });
                $container.css({
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    marginTop: '-' + $container.data(this._options.scrollTopDataAttr) + 'px'
                });
                layerTop('fixed');
                window.scrollTo(0, 0);
            } else {
                // note: 레이어팝업 높이가 뷰사이즈보다 짧은 경우
                /**
                 * html,body 값을 뷰사이즈에 맞게 고정시킨다.
                 * 스크롤을 없앤 이 상태에서 현재 스크롤 위치만큼 컨테이너를 올려서 보이는 위치가 같게 한다.
                 * 레이어팝업은 가운데를 향하게 한다. (css 기본값에 따른다)
                 */
                $('html').css({
                    overflowY: 'scroll',
                    height: '100%'
                });
                $('body').css({
                    overflowY: 'hidden',
                    height: '100%'
                });
                $container.css({
                    position: '',
                    top: '',
                    left: '',
                    right: '',
                    marginTop: '-' + $container.data(this._options.scrollTopDataAttr) + 'px'
                });
                layerInit();
            }
        } else {
            // note: 레이어팝업이 닫힌 경우
            $htmlBody.css({
                overflowY: '',
                height: ''
            });
            $container.css({
                position: '',
                top: '',
                left: '',
                right: '',
                marginTop: ''
            });
            if (document.getElementById(layerId).clientHeight >= window.innerHeight) {
                // note: 레이어팝업 높이가 뷰사이즈보다 길거나 같은 경우
                layerTop();
            } else {
                // note: 레이어팝업 높이가 뷰사이즈보다 짧은 경우
                layerInit();
            }
            if ($container.data(this._options.scrollTopDataAttr) !== undefined) {
                window.scrollTo(0, $container.data(this._options.scrollTopDataAttr));
                $container.removeData(this._options.scrollTopDataAttr);
            }
        }
    } else {
        allInit();
    }
};
JdPopup.prototype.event = function () {
    var $delegate = $(this._options.delegateTarget);

    function click($delegateTarget) {
        var self = this;

        $delegateTarget.on('click', '[' + this._options.chainAttr + '="' + this.$layer[0].id + '"]', function(){
            var id = this.getAttribute(self._options.chainAttr);
            $(this).addClass('click');
            self.start(id, true);
            setTimeout(function () {
                self.on(id);
                self.complete(id, true);
            });

            if (self._options.isDimmed) {
                $delegateTarget.one('click', self.layerEl + ' ' + self._options.closeEl + ', ' + self._options.dimmedEl, close);
            } else {
                $delegateTarget.one('click', self.layerEl + ' ' + self._options.closeEl, close);
            }
            return false;
        });

        function close() {
            var id = $(self.layerEl + '.' + self._options.setClass)[0].id;
            self.start(id, false);
            setTimeout(function () {
                self.off(id);
                self.complete(id, false);
            });
            return false;
        }
    }

    function access($delegateTarget) {
        var self = this,
            elements = ['a', 'button', 'area', 'input', 'textarea', 'object', 'select'];
        $delegateTarget
            .on('keyup', '[' + this._options.chainAttr + '="' + this.$layer[0].id + '"]', function (e) {
                if (e.keyCode === 13) {
                    var id = this.getAttribute(self._options.chainAttr),
                        $id = $('#' + id);
                    function focusing() {
                        $id.find(elements.join()).eq(0).focus();
                    };
                    setTimeout(focusing);
                }
                e.stopPropagation();
            })
            .on('keyup', this.layerEl + ' ' + this._options.closeEl, function (e) {
                if (e.keyCode === 13) {
                    var id = $(this).closest(self.layerEl)[0].id,
                        $id = $('#' + id),
                        $btn = $('[' + self._options.chainAttr + '="' + id + '"]');

                    function focusing() {
                        $btn.focus();
                    }

                    if (self.constructor.cssExtract(id)) {
                        $id.one('transitionend.access webkitTransitionend.access', focusing);
                    } else {
                        setTimeout(focusing);
                    }
                }
                e.stopPropagation();
            })
            .on('keydown', this.layerEl + '.' + this._options.setClass + ' *', function (e) {
                if (elements.indexOf(this.tagName.toLowerCase()) !== -1) {
                    var $focusEl = $(this).closest(self.layerEl).find(elements.join());
                    if (e.keyCode === 9 && e.shiftKey) {
                        if (this === $focusEl[0]) {
                            $focusEl.eq(-1).focus();
                            return false;
                        }
                    } else if (e.keyCode === 9 && !e.shiftKey) {
                        if (this === $focusEl.get(-1)) {
                            $focusEl.eq(0).focus();
                            return false;
                        }
                    }
                }
                e.stopPropagation();
            });
    }

    function resize() {
        var winW = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

        function init(currentW) {
            if ( currentW > this._options.turningPoint ) {
                this.initOptions(this._originOptions);
            } else {
                this._options = $.extend({}, this._options, this._options.responsive);
            }
        }
        function resizeFn() {
            var currentW = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            if (winW !== currentW) {
                if (winW <= this._options.turningPoint ^ currentW <= this._options.turningPoint) {
                    init.call(this, currentW);
                }
                winW = currentW;
            }

            if ($(this.layerEl + '.' + this._options.setClass)[0]) {
                var id = $(this.layerEl + '.' + this._options.setClass)[0].id;
                this.containerFixed(id, true);
            }
        }

        init.call(this, winW);
        if (window.addEventListener) {
            window.addEventListener('resize', resizeFn.bind(this));
        } else {
            window.attachEvent('onresize', resizeFn.bind(this));
        }
    }

    click.call(this, $delegate);
    access.call(this, $delegate);
    resize.call(this);
};