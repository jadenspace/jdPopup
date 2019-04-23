/**
 * 2019-04-23
 * 0.1.1 ver
 * Kim Yeonho
 * https://github.com/jadenspace/jdPopup/
 * https://www.npmjs.com/package/jd-popup/
 */

export function JdPopup(selector, options) {
    this.layerEl = selector;
    this.$layer = document.querySelector(selector);
    this._originOptions = options;
    this._options = null;
    this.initOptions(options || {});
    this.event(true);
}
JdPopup.prototype.initOptions = function (options) {
    this._options = {
        delegateTarget: options.delegateTarget || document,
        containerEl: options.containerEl || '.layout',
        innerEl: options.innerEl || '.layer-pop-inner',
        closeEl: options.closeEl || '.btn-close',
        dimmedEl: options.dimmedEl || '.dimmed',
        setClass: options.setClass || 'on',
        chainAttr: options.chainAttr || 'data-layer-id',
        scrollTopAttr: options.scrollTopAttr || 'data-st',
        a11z: options.a11z || true,
        isDimmed: options.isDimmed || false,
        isFixed: options.isFixed || false,
        onStart: options.onStart || function () {},
        onEnd: options.onEnd || function () {},
        offStart: options.offStart || function () {},
        offEnd: options.offEnd || function () {},
        turningPoint: options.turningPoint || 768,
        responsive: options.responsive || {}
    };
};

JdPopup.prototype.init = function () {
    this.off();
    this.containerFixed(false);
};

JdPopup.prototype.add = function (selector) {
    var check = new RegExp('(\\s|^)' + this._options.setClass + '(\\s|$)');
    if (!selector.className.match(check)) {
        selector.className += ' ' + this._options.setClass;
    }
};
JdPopup.prototype.remove = function (selector) {
    if (selector.className.indexOf(this._options.setClass) !== -1) {
        var check = new RegExp('(\\s|^)' + this._options.setClass + '(\\s|$)');
        selector.className = selector.className.replace(check, ' ').trim();
    }
};
JdPopup.prototype.on = function () {
    var $thisBtn = document.querySelector('[' + this._options.chainAttr + '="' + this.$layer.id + '"]'),
        $dimmed = document.querySelector(this._options.dimmedEl);

    this.add.call(this, $thisBtn);
    this.add.call(this, this.$layer);
    if ( this._options.isDimmed ) { this.add.call(this, $dimmed); }
};
JdPopup.prototype.off = function () {
    var $thisBtn = document.querySelector('[' + this._options.chainAttr + '="' + this.$layer.id + '"]'),
        $dimmed = document.querySelector(this._options.dimmedEl);

    this.remove.call(this, $thisBtn);
    this.remove.call(this, this.$layer);
    if ( this._options.isDimmed ) { this.remove.call(this, $dimmed); }
};
JdPopup.prototype.start = function (isOn) {
    this.containerFixed(isOn);
    if (isOn) {
        this._options.onStart();
    } else {
        this._options.offStart();
    }
};
JdPopup.prototype.complete = function (isOn) {
    var self = this;

    function completeFn() {
        if (isOn) {
            self._options.onEnd();
        } else {
            self._options.offEnd();
        }
    }

    if (this.cssExtract(this.$layer)) {
        ['transitionend','webkitTransitionend'].forEach(function(elem){
            self.$layer.addEventListener(elem, completeFn);
        });
    } else {
        setTimeout(completeFn);
    }
};
JdPopup.prototype.containerFixed = function (isOn) {
    var self = this,
        $html = document.documentElement,
        $body = document.body,
        $container = document.querySelector(this._options.containerEl);

    function _transitionInit() {
        setTimeout(function () {
            self.$layer.style.webkitTransition = '';
            self.$layer.style.transition = '';
        });
    }
    function layerInit() {
        self.$layer.style.webkitTransition = 'unset';
        self.$layer.style.transition = 'unset';
        _transitionInit();
    }
    function layerTop(positionVal, topValue) {
        self.$layer.style.cssText =
            'position:' + (positionVal || '') + ';' +
            'top:' + (topValue || '') + ';' +
            'left:50%;' +
            '-webkit-transform:translate3d(-50%, -' + (topValue || '0') + ', 0);' +
            '-ms-transform:translate(-50%, -' + (topValue || '0') + ');' +
            'transform:translate3d(-50%, -' + (topValue || '0') + ', 0);' +
            '-webkit-transition:unset;' +
            'transition:unset;';
        _transitionInit();
    }
    if (this._options.isFixed) {
        if (isOn) {
            // note: 레이어팝업 열려있는 경우
            if (!$container.getAttribute(this._options.scrollTopAttr)) {
                $container.setAttribute(this._options.scrollTopAttr, window.pageYOffset);
            }
            if (this.$layer.clientHeight >= window.innerHeight) {
                // note: 레이어팝업 높이가 뷰사이즈보다 길거나 같은 경우
                /**
                 * 컨테이너를 fixed 시키고, 현재 스크롤 위치만큼 컨테이너를 올려서 보이는 위치가 같게 한다.
                 * html,body 에는 별도 값을 제외시키고(초기화)
                 * 노출된 레이어팝업을 높이를 가질 수 있게 수정한다.
                 * 상단이 맨 위에 붙도록 조절한다.
                 */
                $html.style.overflowY = '';
                $html.style.height = this.$layer.clientHeight + 'px';
                $body.style.overflowY = '';
                $body.style.height = this.$layer.clientHeight + 'px';
                $container.style.cssText =
                    'position:absolute;' +
                    'top:0;' +
                    'right:0;' +
                    'left:0;' +
                    'height:' + this.$layer.clientHeight + 'px;' +
                    'margin-top:-' + $container.getAttribute(this._options.scrollTopAttr) + 'px;';
                layerTop('absolute');
                window.scrollTo(0, 0);
            } else {
                // note: 레이어팝업 높이가 뷰사이즈보다 짧은 경우
                /**
                 * html,body 값을 뷰사이즈에 맞게 고정시킨다.
                 * 스크롤을 없앤 이 상태에서 현재 스크롤 위치만큼 컨테이너를 올려서 보이는 위치가 같게 한다.
                 * 레이어팝업은 가운데를 향하게 한다. (css 기본값에 따른다)
                 */
                $html.style.overflowY = 'scroll';
                $html.style.height = '100%';
                $body.style.overflowY = 'hidden';
                $body.style.height = '100%';
                $container.style.cssText = 'margin-top:-' + $container.getAttribute(this._options.scrollTopAttr) + 'px;';
                // layerTop('fixed');
                layerTop('fixed', '50%');
            }
        } else {
            // note: 레이어팝업이 닫힌 경우
            $html.style.overflowY = '';
            $html.style.height = '';
            $body.style.overflowY = '';
            $body.style.height = '';
            $container.style.cssText = '';
            if (self.$layer.clientHeight >= window.innerHeight) {
                // note: 레이어팝업 높이가 뷰사이즈보다 길거나 같은 경우
                layerTop();
            } else {
                // note: 레이어팝업 높이가 뷰사이즈보다 짧은 경우
                layerTop(undefined, '50%');
            }
            if ($container.getAttribute(this._options.scrollTopAttr) !== undefined) {
                window.scrollTo(0, parseFloat($container.getAttribute(this._options.scrollTopAttr)));
                $container.removeAttribute(this._options.scrollTopAttr);
            }
        }
    } else {
        $html.style.overflowY = '';
        $html.style.height = '';
        $body.style.overflowY = '';
        $body.style.height = '';
        $container.style.cssText = '';
        if (this.$layer.clientHeight >= window.innerHeight) {
            layerTop();
        } else {
            layerInit();
        }
    }
};
JdPopup.prototype.event = function (flag) {
    var self = this,
        $delegate = this._options.delegateTarget !== document ? document.querySelector(this._options.delegateTarget) : document;

    function click($delegateTarget) {
        function layerToggle(e) {
            if (e.target === document.querySelector('[' + self._options.chainAttr + '="' + self.$layer.id + '"]')) {
                _open();
                $delegateTarget.addEventListener('click', dimmedClose);
                e.preventDefault();
                e.stopPropagation();
            } else if (e.target === document.querySelector(self.layerEl + ' ' + self._options.closeEl)) {
                $delegateTarget.removeEventListener('click', dimmedClose);
                _close();
                e.preventDefault();
                e.stopPropagation();
            }
        }
        function dimmedClose(e) {
            if (self._options.isDimmed && e.target === document.querySelector(self._options.dimmedEl)) {
                $delegateTarget.removeEventListener('click', dimmedClose);
                _close();
                e.preventDefault();
                e.stopPropagation();
            }
        }
        function _open() {
            self.start(true);
            setTimeout(function () {
                self.on();
                self.complete(true);
            });
        }
        function _close() {
            self.start(false);
            setTimeout(function () {
                self.off();
                self.complete(false);
            });
        }

        if (flag) {
            $delegateTarget.addEventListener('click', layerToggle);
        } else {
            $delegateTarget.removeEventListener('click', layerToggle);
            $delegate.removeEventListener('click', dimmedClose);
        }
    }
    function access($delegateTarget) {
        var elements = ['a', 'button', 'area', 'input', 'textarea', 'object', 'select'];

        function thisInner(parentNode) {
            const childNodes = parentNode.childNodes;
            for (var i = 0;i < childNodes.length; i++) {
                if (childNodes[i].className && childNodes[i].className.indexOf(self._options.innerEl.substr(1)) !== -1) {
                    return childNodes[i];
                }
            }
        }
        function enterEvent (e) {
            if (e.keyCode === 13) {
                if (e.target === document.querySelector('[' + self._options.chainAttr + '="' + self.$layer.id + '"]')) { // 레이어팝업 열기 버튼
                    var nodes = thisInner(self.$layer).childNodes;
                    for (var i = 0; i < nodes.length; i++) {
                        if (nodes[i].tagName) {
                            if (elements.indexOf(nodes[i].tagName.toLowerCase()) !== -1) {
                                nodes[i].focus();
                                e.preventDefault();
                                e.stopPropagation();
                                return;
                            }
                        }
                    }
                    e.preventDefault();
                    e.stopPropagation();
                } else if (e.target === document.querySelector(self.layerEl + ' ' + self._options.closeEl)) { // 레이어팝업 닫기 버튼
                    setTimeout(function(){
                        document.querySelector('[' + self._options.chainAttr + '="' + self.$layer.id + '"]').focus();
                    });
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        }
        function tabEvent(e) {
            if (e.keyCode === 9) {
                var focusElements = [];
                if (elements.indexOf(e.target.tagName.toLowerCase()) !== -1) {
                    var nodes = thisInner(self.$layer).childNodes;
                    for (var i = 0; i < nodes.length; i++) {
                        if (nodes[i].tagName) {
                            if (elements.indexOf(nodes[i].tagName.toLowerCase()) !== -1) {
                                focusElements.push(nodes[i]);
                            }
                        }
                    }
                    if (focusElements.indexOf(e.target) !== -1) {
                        if (e.shiftKey) { // shift + tab
                            if (e.target === focusElements[0]) {
                                focusElements[focusElements.length - 1].focus();
                                e.preventDefault();
                                e.stopPropagation();
                            }
                        } else { // tab
                            if (e.target === focusElements[focusElements.length - 1]) {
                                focusElements[0].focus();
                                e.preventDefault();
                                e.stopPropagation();
                            }
                        }
                    }
                }
            }
        }

        if (flag) {
            $delegateTarget.addEventListener('keyup', enterEvent);
            $delegateTarget.addEventListener('keydown', tabEvent);
        } else {
            $delegate.removeEventListener('keyup', enterEvent);
            $delegate.removeEventListener('keydown', tabEvent);
        }
    }
    function resize() {
        var winW = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
            setLoop = null;

        function init(currentW) {
            if ( currentW > self._options.turningPoint ) {
                self.initOptions(self._originOptions);
            } else {
                for (var attr in self._options.responsive) {
                    if (self._options.responsive.hasOwnProperty(attr)) {
                        self._options[attr] = self._options.responsive[attr];
                    }
                }
            }
        }
        function resizeCalc() {
            var currentW = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            if (winW !== currentW) {
                if (winW <= self._options.turningPoint ^ currentW <= self._options.turningPoint) {
                    init(currentW);
                }
                winW = currentW;
            }
            if (document.querySelector(self.layerEl + '.' + self._options.setClass)) {
                self.containerFixed(true);
            }
        }
        function resizeExe() {
            clearTimeout(setLoop);
            resizeCalc();
            setLoop = setTimeout(resizeCalc, 250);
        }

        if (flag) {
            init(winW);
            window.addEventListener('resize', resizeExe);
        } else {
            window.removeEventListener('resize', resizeExe);
        }
    }

    if (this._options.a11z) {access($delegate);}
    click($delegate);
    resize();
};