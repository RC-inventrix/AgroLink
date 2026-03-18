import pickle

try:
    # Load your model
    model = pickle.load(open('model.pkl', 'rb'))

    # Try to print the classes inside the model
    if hasattr(model, 'classes_'):
        print("✅ Found the exact crop mapping in the model!")
        classes = model.classes_

        # Print them out like a dictionary
        mapping = {index: name for index, name in enumerate(classes)}
        for key, value in mapping.items():
            print(f"{key}: '{value}'")
    else:
        print("⚠️ This model doesn't have a 'classes_' attribute saved inside it.")

except Exception as e:
    print(f"Error reading model: {e}")