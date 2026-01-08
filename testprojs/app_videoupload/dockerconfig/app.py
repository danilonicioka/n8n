
import os
from flask import Flask, request, url_for, render_template, jsonify
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'mp4', 'mov', 'avi', 'wmv', 'flv', 'webm', 'mkv'}

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'default_secret_for_dev')
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload-video', methods=['POST'])
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
            file.save(filepath)
            file_url = url_for('static', filename='uploads/' + filename, _external=True)
            return jsonify({
                'success': True,
                'message': f'Video "{filename}" uploaded successfully.',
                'url': file_url,
                'filename': filename
            }), 200
        except Exception as e:
            print(f"Error saving file: {e}")
            return jsonify({'success': False, 'message': 'Server error during save.'}), 500
    else:
        return jsonify({'success': False, 'message': 'Invalid file type.'}), 400

# 🔴 Error simulation route
@app.route('/upload-video-error', methods=['POST'])
def upload_ajax_error():
    """Simulate a failure to test client-side error flow."""
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'message': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        try:
            # Optionally mimic the same flow (save, then fail)
            file.save(filepath)
            # Simulate failure
            raise RuntimeError("Simulated server error after upload")
        except Exception as e:
            print(f"Simulated error: {e}")
            return jsonify({
                'success': False,
                'message': 'Simulated server error: something went wrong after upload.'
            }), 500
    else:
        return jsonify({'success': False, 'message': 'Invalid file type.'}), 400

# ✅ Normal page (success route)
@app.route('/', methods=['GET'])
def index():
    # Pass the normal upload endpoint into the template
    return render_template('upload_ajax.html', upload_url=url_for('upload_ajax'))

# 🔴 Same page, but wired to the error route
@app.route('/error', methods=['GET'])
def index_error():
    # Pass the error simulation endpoint into the template
    return render_template('upload_ajax.html', upload_url=url_for('upload_ajax_error'))

if __name__ == '__main__':
    app.run(debug=True)
