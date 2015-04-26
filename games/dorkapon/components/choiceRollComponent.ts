/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/// <reference path="./mapNodeComponent.ts" />
/// <reference path="../index.ts" />

module dorkapon.components {

  export class ChoiceRollComponent extends pow2.scene.SceneViewComponent {
    host:DorkaponMapView;
    started:boolean = false;
    items:dorkapon.IDorkaponItem[];

    startAngle = 0;
    arc = Math.PI / 3;
    spinTimeout:number = null;

    spinAngleStart = 10;
    spinTime = 0;
    spinTimeTotal = 0;

    selection:dorkapon.IDorkaponItem = null;

    ctx:CanvasRenderingContext2D = null;

    constructor(public target:objects.DorkaponEntity,
                public choices:any[]) {
      super();
      this.items = [];
      for (var i:number = 0; i < 6; i++) {
        this.items.push(choices[_.random(0, choices.length - 1)]);
      }
    }

    connectComponent():boolean {
      return this.host instanceof DorkaponMapView && super.connectComponent();
    }

    disconnectComponent():boolean {
      this.trigger('disconnected');
      return true;
    }

    afterFrame(view:DorkaponMapView, elapsed:number) {
      if (!this.started) {
        this.spin(view);
        this.started = true;
      }
      if (!view.context) {
        return;
      }
      this.ctx = view.context;
      this.drawRouletteWheel(view);
    }

    drawRouletteWheel(view:DorkaponMapView) {
      var outsideRadius = 60;
      var textRadius = 45;
      var insideRadius = 35;

      this.ctx.strokeStyle = "white";
      this.ctx.lineWidth = 2;

      this.ctx.font = 'normal 8px GraphicPixel';

      var renderPoint = view.worldToScreen(view.camera.getCenter());

      for (var i = 0; i < 6; i++) {
        var angle = this.startAngle + i * this.arc;
        this.ctx.fillStyle = '#004c62';


        this.ctx.beginPath();
        this.ctx.arc(renderPoint.x, renderPoint.y, outsideRadius, angle, angle + this.arc, false);
        this.ctx.arc(renderPoint.x, renderPoint.y, insideRadius, angle + this.arc, angle, true);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.save();
        this.ctx.translate(renderPoint.x + Math.cos(angle + this.arc / 2) * textRadius, renderPoint.y + Math.sin(angle + this.arc / 2) * textRadius);
        this.ctx.rotate(angle + this.arc / 2 + Math.PI / 2);
        this.renderIcon(this.items[i].icon, new pow2.Point(), view);
        this.ctx.restore();
      }
      if (this.selection !== null) {
        this.ctx.save();
        this.ctx.font = 'bold 8px GraphicPixel';
        this.ctx.fillStyle = "black";
        this.ctx.fillText(this.selection.name, renderPoint.x + 1 - this.ctx.measureText(this.selection.name).width / 2, renderPoint.y + 11);
        this.ctx.fillStyle = "white";
        this.ctx.fillText(this.selection.name, renderPoint.x - this.ctx.measureText(this.selection.name).width / 2, renderPoint.y + 10);
        this.ctx.restore();
      }

      //Arrow
      this.ctx.fillStyle = "white";
      renderPoint.y -= 10;
      this.ctx.beginPath();
      this.ctx.moveTo(renderPoint.x - 4, renderPoint.y - (outsideRadius + 5));
      this.ctx.lineTo(renderPoint.x + 4, renderPoint.y - (outsideRadius + 5));
      this.ctx.lineTo(renderPoint.x + 4, renderPoint.y - (outsideRadius - 5));
      this.ctx.lineTo(renderPoint.x + 9, renderPoint.y - (outsideRadius - 5));
      this.ctx.lineTo(renderPoint.x + 0, renderPoint.y - (outsideRadius - 13));
      this.ctx.lineTo(renderPoint.x - 9, renderPoint.y - (outsideRadius - 5));
      this.ctx.lineTo(renderPoint.x - 4, renderPoint.y - (outsideRadius - 5));
      this.ctx.lineTo(renderPoint.x - 4, renderPoint.y - (outsideRadius + 5));
      this.ctx.fill();


    }

    spin(view:DorkaponMapView) {
      this.spinAngleStart = Math.random() * 10 + 10;
      this.spinTime = 0;
      this.selection = null;
      this.spinTimeTotal = Math.random() * 3 + 4 * 1000;
      this.rotateWheel(view);
    }

    rotateWheel(view:DorkaponMapView) {
      this.spinTime += 30;
      if (this.spinTime >= this.spinTimeTotal) {
        this.stopRotateWheel(view);
        return;
      }
      var spinAngle = this.spinAngleStart - this.easeOut(this.spinTime, 0, this.spinAngleStart, this.spinTimeTotal);
      this.startAngle += (spinAngle * Math.PI / 180);
      this.spinTimeout = setTimeout(()=> {
        this.rotateWheel(view);
      }, 30);
    }

    stopRotateWheel(view:DorkaponMapView) {
      clearTimeout(this.spinTimeout);
      var degrees = this.startAngle * 180 / Math.PI + 90;
      var arcd = this.arc * 180 / Math.PI;
      var index = Math.floor((360 - degrees % 360) / arcd);
      this.selection = this.items[index];
      _.delay(()=> {
        this.spinTimeout = null;
        this.host.removeComponent(this);
      }, 1000);
    }

    easeOut(t, b, c, d) {
      var ts = (t /= d) * t;
      var tc = ts * t;
      return b + c * (tc + -3 * ts + 3 * t);
    }


    private _renderPoint:pow2.Point = new pow2.Point();
    private _iconCache:{
      [icon:string]:pow2.ImageResource
    } = {};

    renderIcon(icon:string, at:pow2.Point, view:DorkaponMapView) {
      var c = view.world.sprites.getSpriteMeta(icon);
      if (!c) {
        return;
      }
      if (!this._iconCache[c.source]) {
        this._iconCache[c.source] = view.world.sprites.getSpriteSheet(c.source);
        return;
      }
      if (!this._iconCache[c.source].isReady()) {
        return;
      }
      var img:pow2.ImageResource = this._iconCache[c.source];
      // Build render data.
      this._renderPoint.set(at);
      var point = this._renderPoint;
      var scale:number = 1;
      var sourceWidth:number = view.unitSize;
      var sourceHeight:number = view.unitSize;
      if (typeof c.cellWidth !== 'undefined' && typeof c.cellHeight !== 'undefined') {
        sourceWidth = c.cellWidth;
        sourceHeight = c.cellHeight;
      }
      var objWidth = view.fastScreenToWorldNumber(sourceWidth);
      var objHeight = view.fastScreenToWorldNumber(sourceHeight);
      point.x -= objWidth * scale / 2;
      point.y -= objHeight * scale / 2;
      view.fastWorldToScreenPoint(point, point);

      if (c) {
        var cx = c.x;
        var cy = c.y;
        view.context.drawImage(img.data, cx, cy, sourceWidth, sourceHeight, point.x, point.y, sourceWidth * scale, sourceHeight * scale);
      } else {
        view.context.drawImage(img.data, point.x, point.y, sourceWidth * scale, sourceHeight * scale);
      }
    }

  }
}


