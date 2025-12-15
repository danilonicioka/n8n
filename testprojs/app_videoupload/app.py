import os
from flask import Flask, flash, request, redirect, url_for, render_template, jsonify 
from werkzeug.utils import secure_filename

# Define the folder where uploaded files will be stored
UPLOAD_FOLDER = 'static/uploads' 
# Define allowed video extensions
ALLOWED_EXTENSIONS = {'mp4', 'mov', 'avi', 'wmv', 'flv', 'webm', 'mkv'} 

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'default_secret_for_dev')

# Optional: Set a maximum content length (e.g., 100MB) to prevent large uploads
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024 

# Create the upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload-video', methods=['POST']) # New route specifically for AJAX POST
def upload_ajax():
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'success': False, 'message': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        try:
            # Save the file
            file.save(filepath)
            
            # Return success status and the file's URL
            file_url = url_for('static', filename='uploads/' + filename, _external=True)
            return jsonify({
                'success': True, 
                'message': f'Video "{filename}" uploaded successfully.', 
                'url': file_url,
                'filename': filename
            }), 200
        except Exception as e:
            # Handle potential saving errors
            print(f"Error saving file: {e}")
            return jsonify({'success': False, 'message': 'Server error during save.'}), 500
    else:
        return jsonify({'success': False, 'message': 'Invalid file type.'}), 400

# Keep your main route for rendering the page
@app.route('/', methods=['GET'])
def index():
    return render_template('upload_ajax.html') 

if __name__ == '__main__':
    app.run(debug=True)