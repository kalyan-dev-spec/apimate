import json

def convert_parameter_description_to_array(entry):
    if entry is None:
        return entry
    param_desc = entry.get("parameter_description", {})
    api_params = []
    print("param_desc", param_desc)
    for name, description in param_desc.items():
        api_params.append({
            "name": name,
            "required": "required" if name in ["file", "model_name"] else "optional",  # Customize logic here
            "description": description
        })

    entry["parameter_description"] = api_params
    return entry

def transform_file(input_path, output_path):
    with open(input_path, "r") as f:
        data = json.load(f)

    transformed = [convert_parameter_description_to_array(entry) for entry in data]

    with open(output_path, "w") as f:
        json.dump(transformed, f, indent=2)
    
    print(f"✅ Transformed JSON written to {output_path}")


# Example usage
transform_file("api_dataset_4.json", "api_dataset_4_seed.json")