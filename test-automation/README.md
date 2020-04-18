# **Postman Backend API Testing**
In order to run the test cases within this folder, the follow these steps:
1. Download the Postman application [here](https://www.postman.com/downloads/).
2. Once the Postman application is installed, navigate to the homepage.
3. Click on the "import" button near the top left corner and select the specified test case file(s).
4. Hover over the generated test folder and click on the play button to run all tests. 

## Account Feature Testing
To test all necessary corner cases and base functionality, the test cases were split between the following equivalence partitions:

- Valid Tests:
  1. Account Creation
  2. Account Verification
  3. Account Deletion
- Invalid Tests: 
  1. Account Creation: Empty values, Null input fields, and overflow values for username, password, and email fields
  2. Account Verification: Nonexistent users to verify, Wrong password for an existing username
  3. Account Deletion: Deleting nonexistant users, deleting with incorrect credentials
