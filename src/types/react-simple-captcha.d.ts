declare module 'react-simple-captcha' {
  export function loadCaptchaEnginge(
    length?: number,
    backgroundColor?: string,
    textColor?: string
  ): void;

  export function validateCaptcha(userInput: string): boolean;

  export function LoadCanvasTemplate(props: {
    reloadText?: string;
    canvasStyle?: React.CSSProperties;
  }): JSX.Element;

  export function resetCaptchaEngine(): void;
}
