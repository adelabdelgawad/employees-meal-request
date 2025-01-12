// 1. Fetch roles (returns the roles examples)
export async function fetchRoles() {
  return [
    {
      id: 1,
      name: 'Administrator',
      description: 'Full access to all features and settings',
    },
    { id: 2, name: 'Editor', description: 'Can edit and publish content' },
    { id: 3, name: 'Viewer', description: 'Can view content only' },
  ];
}

// 2. Fetch domain users (returns the users examples)
export async function fetchDomainUsers() {
  return [
    {
      id: 1,
      fullName: 'John Doe',
      username: 'johndoe',
      title: 'Software Engineer',
    },
    {
      id: 2,
      fullName: 'Jane Smith',
      username: 'janesmith',
      title: 'Product Manager',
    },
    {
      id: 3,
      fullName: 'Mike Johnson',
      username: 'mikej',
      title: 'UI/UX Designer',
    },
  ];
}

// 3. Submit Add User (logs the created user details)
export async function submitAddUser(userId: number, roles: number[]) {
  // Simulate user creation process
  console.log('User created:', { userId, roles });

  // Return a confirmation response
  return {
    success: true,
    message: 'User added successfully',
    data: { userId, roles },
  };
}
