/**
 * Define o tipo de objeto resultante da mesclagem, que pode conter chaves de A e B.
 * Se houver chaves em comum, o objeto do segundo array (Payload/B) prevalece.
 */
type MergedObject<T, U> = T & U;

/**
 * Mescla dois arrays de objetos de mesmo tamanho e ordem, combinando
 * todas as chaves de objetos correspondentes. Caso repetir chave o arrayB prevalece.
 *
 * @param arrayA O primeiro array (geralmente os dados existentes).
 * @param arrayB O segundo array (geralmente o payload de atualização).
 * @returns Um novo array com os objetos mesclados.
 * @throws {Error} Se os arrays não tiverem o mesmo comprimento.
 */
export default function mergeArrays<T extends Record<string, any>, U extends Record<string, any>>(
  arrayA: Array<T>,
  arrayB: Array<U>
): Array<MergedObject<T, U>> {
  
  if (arrayA.length !== arrayB.length) {
    throw new Error(`mergeArrays: Os arrays devem ter o mesmo comprimento (A: ${arrayA.length}, B: ${arrayB.length}).`);
  }

  return arrayA.map((objA, i) => {
    const objB = arrayB[i];

    return {
      ...objA,
      ...objB
    } as MergedObject<T, U>;
  });
}
