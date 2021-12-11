import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import sys

cred = credentials.Certificate('../../secrets/service_account_file.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

def safe_delete(doc_refs):
    doc_refs = [doc_refs] if type(doc_refs) != list else doc_refs
    for doc_ref in doc_refs:
        batch_safe_delete([doc_ref])

def batch_safe_delete(doc_refs):
    docs = [doc_ref.id for doc_ref in doc_refs]
    ans = input(f"Are you sure you want to delete {', '.join(docs)}? (y/N) ")
    if ans != 'y':
        print("Aborting")
        sys.exit(1)
    for doc_ref in doc_refs:
        doc_ref.delete()
    print(f"Deleted {len(doc_refs)} documents")

def main():
    collection = u'ropsten'
    docs = db.collection(collection).stream()
    docs_to_delete = [doc.reference for doc in docs if 'metadata' not in doc.id]
    batch_safe_delete(docs_to_delete)

main()
