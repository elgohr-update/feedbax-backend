import type { ToggleActions } from '@shared/models/like';
import type { LikeResolved } from '@shared/models/like';

import type { AnswerModel } from '~models/Answer';
import type { LikeModel } from '~models/Like';

export type Context = {
  question: { id: string };
  answer: { id: string };
}

export type GetContext = (Like: LikeModel) => Promise<Context>;
export type ToggleTuple = [ToggleActions, Context, LikeResolved];

export interface Props {
  answer: AnswerModel;
  answerId: string | null;
}

export interface ByAnswer {
  (answer: Props['answer'], author: string): Promise<ToggleTuple>;
}

export interface ByAnswerId {
  (answerId: Props['answerId'], author: string): Promise<ToggleTuple>;
}

export interface Toggle {
  (author: string, props: Pick<Props, 'answer'>): Promise<ToggleTuple>;
  (author: string, props: Pick<Props, 'answerId'>): Promise<ToggleTuple>;
}