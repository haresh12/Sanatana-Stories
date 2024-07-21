import * as functions from 'firebase-functions';
import { updateFunFact } from '../dynamicContent/updateFunFact';
import { updateMyth } from '../dynamicContent/updateMyth';

export const scheduledFunction = functions.pubsub.schedule('every 2 minutes').onRun(async () => {
  await updateFunFact();
  await updateMyth();
  return null;
});
