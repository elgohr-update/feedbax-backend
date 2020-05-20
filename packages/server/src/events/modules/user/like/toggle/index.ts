import Packets from '@shared/packets/ids';
import { ToggleActions, LikeKeys } from '@shared/models/like';
import { ContextKeys } from '@shared/packets/context';

import { debug, error } from '~lib/logger';
import BulkUpdateBroadcast, { UpdateAction } from '~lib/update-broadcast';

import { EventHandler } from '~events/helper/event-handler';
import { checkSessionVars, presetUserWithEvent } from '~events/helper/fbx-socket';

import statics from '~models/statics';

import type { Packet as PacketOutCreate } from '@shared/packets/server/like/create';
import type { Packet as PacketOutDestroy } from '@shared/packets/server/like/destroy';
import type { Response } from '@shared/packets/response/like/toggle';

import type { Handler } from './types';

const handler: Handler = async function (this, packet, response) {
  const { LikeModelStatic } = statics.models;

  const logPath = `${this.namespace.name}/like/toggle`;
  debug(logPath, this.socket.id, JSON.stringify(packet));

  try {
    if (!checkSessionVars(this.socket, presetUserWithEvent)) return;

    const { answer } = packet;
    const { currentEventId } = this.socket.auth;
    const { id: answerId } = answer;

    const [action, context, like] = await LikeModelStatic.toggle(
      this.socket.auth.browserUUID,
      { answerId },
    );

    let $packetOut: PacketOutCreate | PacketOutDestroy;
    let $action: Response;

    // eslint-disable-next-line default-case
    switch (action) {
      case ToggleActions.Created: {
        $packetOut = [
          context,
          like,
        ];

        $action = {
          action,
          payload: $packetOut,
        };

        break;
      }

      case ToggleActions.Destroyed: {
        $packetOut = [
          context,
          like[LikeKeys.id],
        ];

        $action = {
          action,
          payload: $packetOut,
        };

        break;
      }
    }

    const $questionId = context[ContextKeys.questionId];
    const $answerId = context[ContextKeys.answerId];

    BulkUpdateBroadcast.broadcast(currentEventId, {
      action: UpdateAction.UpdateLikes,
      payload: {
        questionId: $questionId,
        answerId: $answerId,
      },
    });

    response({
      success: true,
      data: $action,
    });
  } catch (err) {
    error(`${this.namespace.name}/like/toggle`, this.socket.id, err);

    response({
      success: false,
      data: undefined,
      error: {
        name: err.name,
        message: err.message,
      },
    });
  }
};

export default EventHandler.create(
  Packets.Client.User.Like.Toggle,
  handler,
);
