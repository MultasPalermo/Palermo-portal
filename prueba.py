
numeros = [5, 1, 9, 3, 7]

for i in range(len(numeros)):
    for j in range(i + 1, len(numeros)):
        if numeros[i] < numeros[j]:
            numeros[i], numeros[j] = numeros[j], numeros[i]

print("lista ordenada de mayor a menor:", numeros)