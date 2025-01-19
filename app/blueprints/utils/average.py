def weighted_average(values, weights):
    if not values or not weights:
        raise ValueError("Listy wartości i wag nie mogą być puste.")
        
    if len(values) != len(weights):
        raise ValueError("Długość list wartości i wag musi być taka sama.")
        
    total_weighted = sum(value * weight for value, weight in zip(values, weights))
    total_weights = sum(weights)
        
    if total_weights == 0:
        raise ValueError("Suma wag nie może być zerowa.")
        
    return round(total_weighted / total_weights, 2)
