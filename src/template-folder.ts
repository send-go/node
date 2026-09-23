import type { HttpClient } from './http-client';
import type { SendgoResponse, TemplateFolderListParams, TemplateFolderCreateParams, TemplateFolderAssignParams } from './types';

/** 템플릿 공용 폴더. v2 전용이며 기업 계정에서 사용합니다. */
export class TemplateFolderService {
  constructor(private readonly http: HttpClient) {}

  /** 폴더 트리와 유형별 템플릿 수를 조회합니다. */
  async list(params: TemplateFolderListParams = {}): Promise<SendgoResponse> {
    return this.http.get(this.http.buildResourceUrl('template-folders'), { ...params });
  }

  /** 루트 또는 하위 폴더를 생성합니다. */
  async create(params: TemplateFolderCreateParams): Promise<SendgoResponse> {
    return this.http.post(this.http.buildResourceUrl('template-folders'), { ...params });
  }

  /** 1~100개 템플릿을 이동합니다. folderUuid: null은 폴더에서 꺼냅니다. */
  async assign(params: TemplateFolderAssignParams): Promise<SendgoResponse> {
    return this.http.patch(this.http.buildResourceUrl('template-folders', 'templates'), { ...params });
  }
}
