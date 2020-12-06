export interface script_record {
    id: String;
    name: String;
    script_type: String;
    is_released: Boolean;
    description: String;
    path: String;
    deployment: String;
    apply_to: String[];
}