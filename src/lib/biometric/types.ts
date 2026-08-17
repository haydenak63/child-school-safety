export type GrayImage = {
  data: Uint8Array;
  width: number;
  height: number;
};

export type FingerprintTemplatePayload = {
  version: 1;
  algorithm: "camera-texture-v1";
  provider: "camera";
  width: number;
  height: number;
  lbp: number[];
  hog: number[];
  patch: number[];
  dhash: string;
  quality: number;
};

export type Template = {
  format: string;
  data: string;
  quality: number;
};

export type TemplateRecord = {
  studentId: string;
  template: Template;
};

export type MatchResult = {
  matched: boolean;
  studentId?: string;
  score: number;
  confidence: number;
  quality: number;
};

export interface BiometricProvider {
  enroll(image: Buffer): Promise<Template>;
  verify(image: Buffer, template: Template): Promise<MatchResult>;
  identify(image: Buffer, gallery: TemplateRecord[], threshold?: number): Promise<MatchResult>;
}

export interface FingerprintService {
  enroll(image: GrayImage): Template;
  createTemplate(image: GrayImage): FingerprintTemplatePayload;
  match(image: GrayImage, template: FingerprintTemplatePayload): MatchResult;
  identify(
    image: GrayImage,
    templates: Array<{ studentId: string; template: FingerprintTemplatePayload }>,
    threshold: number,
  ): MatchResult;
}
