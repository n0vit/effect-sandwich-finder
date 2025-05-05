import { Effect, Random, Schedule, Fiber, pipe, Console } from 'effect';


const logBlock = (data: {
  slot: number,
  hasSandwiches: boolean
}) => Console.log('Produced slot', data.slot, 'hasSandwiches', data.hasSandwiches);


const getBlock = (initialSlot: number) => pipe(
  Random.nextBoolean,
  Effect.map(hasSandwiches => {
    const slot = initialSlot+=1;
    return {
      slot,
      hasSandwiches: hasSandwiches
    };
  }),
  Effect.tap(logBlock));



const produceBlockWithLog = Effect.repeat(getBlock(0), Schedule.spaced(400)); // 400 ms

//      ┌─── RuntimeFiber<number, never>
//      ▼
console.log('Starting fiber');
const fiber = Effect.runFork(produceBlockWithLog);


setTimeout(() => {
  Effect.runFork(Fiber.interrupt(fiber));
  console.log('Finished fiber');
}, 3200);


// const gen =  Stream.repeatEffect(getBlock,  );
