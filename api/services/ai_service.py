import requests
import json
import os 
import redis
#from llama_index.llms.openai import OpenAI
#from llama_index.core import Document, VectorStoreIndex
#f = open('db.json')
#db = json.load(f)

class AIService():
    
    def __init__(self):
        self.url = "https://api.perplexity.ai/chat/completions"
        self.token = os.environ.get('PERPLEXITY_API_KEY') 
        self.r = redis.Redis.from_url(os.environ.get('REDIS_URL'))
        self.db = self.load_dict()

    def save_dict(self, data):
        self.r.set(self.db, json.dumps(data))

    def load_dict(self):
        value = self.r.get('db')
        return json.loads(value) if value else {}
 
    def perplexity_request(self, messages):
        payload = {
            "model": "llama-3.1-sonar-huge-128k-online",
            "messages": messages,
        #    "max_tokens": "Optional",
            "temperature": 0.2,
            "top_p": 0.9,
            "search_domain_filter": ["perplexity.ai"],
            "return_images": False,
            "return_related_questions": False,
            "search_recency_filter": "month",
            "top_k": 0,
            "stream": False,
            "presence_penalty": 0,
            "frequency_penalty": 1
        }
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }

        response = requests.request("POST", self.url, json=payload, headers=headers)
        return response.json()
    
    def find_influencer(self, name):
        messages = [
                {
                    "role": "system",
                    "content": "You're a search assistant that returns ONLY a description for a specific health influencer/advisor"
                },
                {
                    "role": "user",
                    "content": 

                    f'''
                        I want a description for {name}
                    '''
                }
        ]
        response = self.perplexity_request(messages)
        print(response)
        description = response['choices'][0]['message']['content']
        print(name, description)
        name = name.strip()
        if name not in self.db:
            self.db[name] = {
                'name': name,
                'description': description,
                'claims': []
            }
        try:
            self.find_claims(name)
        except Exception as e:
            print(f'error finding claims for {name}', e)
        self.save_dict()

        return self.db[name]
    
    def find_influencers(self):
        messages = [
                {
                    "role": "system",
                    "content": "You're a search assistant that returns ONLY LISTS based on the user format example. DON'T write anything else than listing the responses, do not number the list"
                },
                {
                    "role": "user",
                    "content": 

                    '''
                        I want a list of 10/20 health influencers(or advisors)
                        use exclusivily the format to list "<name> - <description>" (break line to the next item)
                        create a 50-80 words description for each influencer
                        (dont write any extra text, only the list)
                        don't use markdown, use plain text
                    '''
                }
        ]
        response = self.perplexity_request(messages)
        print(response)
        content = response['choices'][0]['message']['content']
        for l in content.splitlines():
            if l :
                name, description = l.split('-', 1)
                name = name.strip()
                print(name, description)
                if name not in self.db:
                    self.db[name] = {
                        'name': name,
                        'description': description,
                        'claims': []
                    }
                try:
                    self.find_claims(name)
                except Exception as e:
                    print(f'erro finding claims for {name}', e)
        self.save_dict()

    def find_claims(self, influencer):
        messages = [
                {
                    "role": "system",
                    "content": ''' You're a search assistant that finds claims from famous health influencers and output ONLY JSON(don't write any text, just the JSON response), in the following format:
                        [
                            {
                                claim: <claim>,
                                category: <category> #e.g Nutrition, Medicine, Mental Health or category of the claim
                                source: <source> # e.g Twitter|podcast|youtube|others,
                                date: <claim date> # if date isn't specified use the date from the source or 'NA'
                            },
                        ]
                    '''
                },
                {
                    "role": "user",
                    "content": 
                    f'''find 10-20 claims from {influencer} '''
                }
        ]
        response = self.perplexity_request(messages)
        content = response['choices'][0]['message']['content']
        citations = response['citations']
        content = json.loads(content)
        for c in content:    
            try:
                claim = {
                        'claim': c['claim'],
                        'citations': citations,
                        'category': c['category'],
                        'date': c['date'],
                        'source': c['source'],
                        'data': self.verify_claim(c['claim'])

                }
                if influencer in self.db:
                    self.db[influencer]['claims'].append(claim)
                else :
                    self.db[influencer] = { 'claims': [claim]}
            except Exception as e:
                print(f'Error on adding {influencer} claim {c}', e)

        self.save_dict()

    def verify_claim(self, claim):
        messages = [
                {
                    "role": "system",
                    "content": ''' You're a Claim check assistant that will output ONLY JSON object, the format should be:
                        {
                            claim: <claim input>,
                            verification: Verified|Questionable|Debunked,
                            comment: Explain the verification for the claim
                        }
                    '''
                },
                {
                    "role": "user",
                    "content": 
                    f'''
                        Verify either this claim is Verified, Questionable, Debunked:
                        {claim}
                    '''
                }
        ]
        response = self.perplexity_request(messages)
        content = response['choices'][0]['message']['content']
        citations = response['citations']
        content = json.loads(content)
        print('claim verification', content)
        res = {
            'citations': citations,
            'status': content['verification'],
            'status_comment': content['comment']
        }
        return res

#    def search_claims(self, influencer):
#        # Convert each entry into a LlamaIndex Document
#        llm = OpenAI(model='gpt-4', api_key=os.environ.get('OPENAI_API_KEY'))
#        documents = []
#        for entry in db.values():
#            name = entry["name"]
#            description = entry["description"]
#            for claim in entry["claims"]:
#                # Combine claim data into a single text field
#                text = (
#                    f"Name: {name}\n\n"
#                    f"Description: {description}\n\n"
#                    f"Claim: {claim['claim']}\n\n"
#                    f"Citations: {', '.join(claim['citations'])}\n\n"
#                    f"Category: {claim['category']}\n\n"
#                    f"Date: {claim['date']}\n\n"
#                    f"Source: {claim['source']}\n\n"
#                    f"Status: {claim['data']['status']}\n\n"
#                    f"Status Comment: {claim['data']['status_comment']}"
#                )
#
#                # Create a Document with metadata
#                documents.append(
#                    Document(
#                        text=text,
#                        extra_info={"name": name, "category": claim["category"], "date": claim["date"]}
#                    )
#                )
#        index = VectorStoreIndex.from_documents(documents)
#        query_engine = index.as_query_engine(llm=llm)
#        resp = query_engine.query(f'what are common claims from {influencer}')
#        print('res', resp)
#        return
    
    def list_influencers(self):
        influencers = []
        for key, value in self.db.items():
            name = value.get("name", "Unknown")
            claims = value.get("claims", [])
            
            # Initialize variables for trust score and claim count
            trusted_score = 0
            checked_claims = len(claims)

            # Calculate trusted score
            for claim in claims:
                status = claim.get("data", {}).get("status", "Unknown")
                if status == "Verified":
                    trusted_score += 1
                elif status == "Questionable":
                    trusted_score += 0.5
                # Debunked claims add 0 to the score

            # Adjust trusted score to percentage
            if checked_claims > 0:
                trusted_score = (trusted_score / checked_claims) * 100
                # Add influencer data to the list
                influencers.append({
                    "name": name,
                    "trusted_score": round(trusted_score,2),
                    "checked_claims": checked_claims
                })
        influencers.sort(key=lambda x: x["trusted_score"], reverse=True)

        return influencers
    
    def get_influencer(self, name):
        if name not in self.db:
            value = self.find_influencer(name)
        value = self.db[name]
        name = value.get("name", "Unknown")
        claims = value.get("claims", [])
        
        # Initialize variables for trust score and claim count
        trusted_score = 0
        checked_claims = len(claims)

        # Calculate trusted score
        for claim in claims:
            status = claim.get("data", {}).get("status", "Unknown")
            if status == "Verified":
                trusted_score += 1
            elif status == "Questionable":
                trusted_score += 0.5
        trusted_score = 0
        if checked_claims > 0:
            trusted_score = (trusted_score / checked_claims) * 100

        value['trusted_score'] = round(trusted_score,2)
        value['checked_claims']= checked_claims
        return value        
    def keys(self):
        return list(self.db.keys())
        
if __name__ == '__main__':
    ai_service = AIService()
    ai_service.find_influencers()
  #  ai_service.find_influencer('Andrew Huberman')
   # fjson = open('db.json', 'w')
    #json.dump(db, fjson)
    ai_service.find_influencer('Andrew Huberman')
 #   ai_service.search_claims('Andrew Huberman')
#    ai_service.search_claims('Andrew Huberm')

