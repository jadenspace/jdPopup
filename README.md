# jdPopup API
- IE9~ 호환.
- 웹/모바일 옵션 분리 처리.

## HTML

- 레이어팝업 이동을 위한 버튼에 data-layer-id의 값을 레이어팝업 ID와 동일하게 부여.

`<button type="button" data-layer-id="layer1">레이어팝업 열기</button>`

- 딤드는 dimmedEl 옵션에 부여한 값으로 클래스 설정.

`<div class="dimmed"></div>`

- 레이어팝업은 id를 꼭 부여해야하며, 레이어팝업 닫기 버튼은 closeEl 옵션에 부여한 값으로 클래스 설정. 

```xml
<div id="layer1" class="layer-pop">
    <div class="layer-pop-inner">
        <button type="button" class="btn-close">닫기</button>
    </div>
</div>
```

## CSS
- 기본구조

```css
.dimmed{visibility:hidden;position:fixed;top:0;right:0;bottom:0;left:0;margin:auto;background-color:rgba(0,0,0,.3);opacity:0;}
.dimmed.on{visibility:visible;opacity:1;}
.layer-pop{visibility:hidden;position:absolute;top:0;left:50%;transform:translate(-50%,0);opacity:0;}
.layer-pop.on{visibility:visible;opacity:1;}
.layer-pop .layer-pop-inner{width:100%;height:100%;}
```

## JS
- 반응형 기본구조

```javascript
var layer = new JdPopup('#layer1', {
    isDimmed: true,
    isFixed: false,
    turningPoint: 768,
    responsive: {
        isFixed: true
    }
});
```

- 옵션값

|옵션값|내 용|기본값|타 입|
|:---|:---|:---|:---|
|delegateTarget|공통 이벤트 객체 셀렉터|document|document 혹은 CSS selectors|
|containerEl|레이어팝업 고정 시 노출되는 영역 셀렉터|'.layout'|CSS selectors|
|innerEl|레이어팝업 내 내용 및 버튼 등을 감싸는 셀렉터|'.layer-pop-inner'|CSS selectors|
|closeEl|레이어팝업 내 닫기 버튼 셀렉터|'.btn-close'|CSS selectors|
|dimmedEl|배경 마스크 셀렉터|'.dimmed'|CSS selectors|
|setClass|노출/미노출에 따른 class 속성 지정|'on'|classname|
|chainAttr|레이어팝업과 연결시킬 버튼 data 속성|'data-layer-id'|data attribute|
|scrollTopDataAttr|현재 스크롤 위치를 저장시킬 data 속성|'data-st'|data attribute|
|a11z|접근성 적용 여부|true|boolean|
|isDimmed|배경 마스크 노출 여부|false|boolean|
|isFixed|레이어팝업 노출 시 스크롤 고정 여부|false|boolean|
|onStart|레이어팝업 노출 시 transitionstart| |function|
|onEnd|레이어팝업 노출 시 transitionend| |function|
|offStart|레이어팝업 미노출 시 transitionstart| |function|
|offEnd|레이어팝업 미노출 시 transitionend| |function|
|turningPoint|responsive 옵션 설정 시 분기 사이즈|768|number|
|responsive|뷰 사이즈가 turningPoint 이하인 경우 옵션값 설정| |object|

- 기능

|설명|메서드|param|example|
|:---|:---|:---|:---|
|이벤트 초기화|.event|false|layer.event(false)|
|이벤트 재설정|.event|true|layer.event(true)|
|class 추가|.add|element|layer.add(document.querySelector('.dimmed')|
|class 제거|.remove|element|layer.remove(document.querySelector('.dimmed')|
|레이어팝업 노출|.on| |layer.on()|
|레이어팝업 미노출|.off| |layer.off()|