import fitz

doc = fitz.open()
page = doc.new_page()
text = """
JOHN DOE
Software Engineer

EXPERIENCE:
- Senior Developer at TechCorp (2020-2024)
  Worked with Python, FastAPI, and React.
  Managed AWS infrastructure and Docker containers.

- Junior Developer at WebSoft (2018-2020)
  Built responsive web apps with JavaScript, HTML, and CSS.

SKILLS:
Python, JavaScript, React, FastAPI, AWS, Docker, Git, SQL, Tailwind CSS.

EDUCATION:
B.S. in Computer Science, University of Technology.
"""
page.insert_text((50, 50), text)
doc.save("test_resume.pdf")
doc.close()
print("Generated test_resume.pdf")
