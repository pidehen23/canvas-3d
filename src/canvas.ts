export class Application {
  private canvas: HTMLCanvasElement | null = null; // 画布
  private ctx: CanvasRenderingContext2D | null = null; // 环境
  private w: number = 0; // 画布宽
  private h: number = 0; // 画布高
  private textures = new Map<number, string>(); // 纹理集
  private spriteData = new Map<number, HTMLImageElement>(); // 精灵数据
  private roleIndex = 0; // 当前角色图片
  private isActive = false; // 输入设备是否按下
  private startX = 0; // 转动x轴起始点
  private static MAX_IMAGE_COUNT = 36;

  constructor() {
    this.init();
  }

  init = () => {
    // 初始化
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d");
    window.addEventListener("resize", this.reset);
    this.reset();
    for (let i = 0; i < Application.MAX_IMAGE_COUNT; i++) {
      this.textures.set(i, `/assets/${i + 1}.jpg`);
    }
    this.load().then(this.render);
  };

  load = () => {
    // 加载纹理
    const { textures, spriteData } = this;
    let flag = 0;
    return new Promise<void>((resolve, reject) => {
      if (textures.size === 0) resolve();
      for (const key of textures.keys()) {
        const _img = new Image();
        spriteData.set(key, _img);
        // eslint-disable-next-line no-loop-func
        _img.onload = () => {
          if (++flag === textures.size) {
            return resolve();
          }
        };
        _img.onerror = (error) => {
          return reject(error);
        };
        _img.src = textures.get(key)!;
      }
    });
  };

  reset = () => {
    // 调屏重新获取宽高
    if (this.canvas && this.ctx) {
      this.w = this.canvas.width = window.innerWidth / 1.2;
      this.h = this.canvas.height = window.innerHeight / 1.2;

      this.step();
    }
  };

  isMobile = () => {
    let mobileArry = [
      "iPhone",
      "iPad",
      "Android",
      "Windows Phone",
      "BB10; Touch",
      "BB10; Touch",
      "PlayBook",
      "Nokia",
    ];
    let ua = navigator.userAgent;
    let res = mobileArry.filter((arr) => {
      return ua.indexOf(arr) > 0;
    });
    return res.length > 0;
  };

  render = () => {
    this.step();
    if (this.isMobile()) {
      this.canvas?.addEventListener("touchstart", this.touchStart);
      this.canvas?.addEventListener("touchmove", this.touchMove, false);
      this.canvas?.addEventListener("touchend", this.touchEnd, false);
    } else {
      this.canvas?.addEventListener("mousedown", this.touchStart);
      this.canvas?.addEventListener("mousemove", this.touchMove, false);
      this.canvas?.addEventListener("mouseup", this.touchEnd, false);
      this.canvas?.addEventListener("mouseover", this.touchEnd, false);
    }
  };

  drawRole = () => {
    const { ctx, w, h, spriteData, roleIndex } = this;
    const img = spriteData.get(roleIndex);
    if (img) {
      ctx?.save();
      ctx?.translate(w / 2 - img.width / 4, h / 2 - img.height / 4);
      ctx?.scale(0.5, 0.5);
      ctx?.drawImage(img, 0, 0);
      ctx?.restore();
    }
  };

  step = () => {
    console.log(`开始渲染第 ${this.roleIndex}张图`);
    // 重绘
    const { w, h, ctx } = this;
    // window.requestAnimationFrame(this.step);
    ctx?.clearRect(0, 0, w, h);
    this.drawRole();
  };

  touchStart = (e: TouchEvent | MouseEvent) => {
    let event: MouseEvent | Touch = e as MouseEvent | Touch;
    if ((e as TouchEvent)?.changedTouches) {
      event = (e as TouchEvent).changedTouches[0];
    }
    this.startX = event.clientX;
    this.isActive = true;
  };

  touchMove = (e: TouchEvent | MouseEvent) => {
    let event: MouseEvent | Touch = e as MouseEvent | Touch;
    if (!this.isActive) return;
    if ((e as TouchEvent).changedTouches) {
      event = (e as TouchEvent).changedTouches[0];
    }

    console.log("distance", e);

    if (this.startX > event.clientX) {
      this.roleIndex--;
    }
    if (this.startX < event.clientX) {
      this.roleIndex++;
    }
    if (this.roleIndex < 0) this.roleIndex += Application.MAX_IMAGE_COUNT;
    this.roleIndex %= Application.MAX_IMAGE_COUNT;
    this.startX = event.clientX;

    window.requestIdleCallback(this.step, {
      timeout: window.parseInt(String(2 * (1 / 60) * 1000)),
    });
  };

  touchEnd = () => {
    this.isActive = false;
  };
}
