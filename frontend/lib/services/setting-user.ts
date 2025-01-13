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
      fullName: 'Jessica Davis',
      username: 'jessicadavis',
      title: 'Software Engineer',
      roles: ['Administrator', 'Editor', 'Viewer'],
    },
    {
      id: 2,
      fullName: 'Mike Moore',
      username: 'mikemoore',
      title: 'Project Manager',
      roles: ['Manager', 'Administrator'],
    },
    {
      id: 3,
      fullName: 'John Miller',
      username: 'johnmiller',
      title: 'Data Scientist',
      roles: ['Viewer', 'Administrator'],
    },
    {
      id: 4,
      fullName: 'Sarah Miller',
      username: 'sarahmiller',
      title: 'Data Scientist',
      roles: ['Manager', 'Administrator', 'Editor'],
    },
    {
      id: 5,
      fullName: 'Tom Johnson',
      username: 'tomjohnson',
      title: 'Product Manager',
      roles: ['Administrator'],
    },
    {
      id: 6,
      fullName: 'Mike Davis',
      username: 'mikedavis',
      title: 'Product Manager',
      roles: ['Viewer', 'Manager'],
    },
    {
      id: 7,
      fullName: 'David Wilson',
      username: 'davidwilson',
      title: 'UI/UX Designer',
      roles: ['Editor'],
    },
    {
      id: 8,
      fullName: 'Chris Smith',
      username: 'chrissmith',
      title: 'Data Scientist',
      roles: ['Manager'],
    },
    {
      id: 9,
      fullName: 'Jane Moore',
      username: 'janemoore',
      title: 'Software Engineer',
      roles: ['Editor', 'Administrator', 'Manager'],
    },
    {
      id: 10,
      fullName: 'Jane Brown',
      username: 'janebrown',
      title: 'Project Manager',
      roles: ['Administrator'],
    },
    {
      id: 11,
      fullName: 'Emily Wilson',
      username: 'emilywilson',
      title: 'Software Engineer',
      roles: ['Viewer', 'Administrator'],
    },
    {
      id: 12,
      fullName: 'Jessica Moore',
      username: 'jessicamoore',
      title: 'Project Manager',
      roles: ['Editor'],
    },
    {
      id: 13,
      fullName: 'David Miller',
      username: 'davidmiller',
      title: 'UI/UX Designer',
      roles: ['Viewer'],
    },
    {
      id: 14,
      fullName: 'Tom Williams',
      username: 'tomwilliams',
      title: 'UI/UX Designer',
      roles: ['Manager', 'Administrator'],
    },
    {
      id: 15,
      fullName: 'Emily Williams',
      username: 'emilywilliams',
      title: 'UI/UX Designer',
      roles: ['Editor'],
    },
    {
      id: 16,
      fullName: 'Jane Johnson',
      username: 'janejohnson',
      title: 'Project Manager',
      roles: ['Editor', 'Manager', 'Viewer'],
    },
    {
      id: 17,
      fullName: 'John Wilson',
      username: 'johnwilson',
      title: 'Data Scientist',
      roles: ['Administrator', 'Viewer'],
    },
    {
      id: 18,
      fullName: 'Emily Williams',
      username: 'emilywilliams',
      title: 'Product Manager',
      roles: ['Editor', 'Viewer', 'Manager'],
    },
    {
      id: 19,
      fullName: 'Emily Johnson',
      username: 'emilyjohnson',
      title: 'Project Manager',
      roles: ['Administrator', 'Manager', 'Editor'],
    },
    {
      id: 20,
      fullName: 'David Johnson',
      username: 'davidjohnson',
      title: 'Product Manager',
      roles: ['Viewer'],
    },
  ];
}

export async function fetchUsers() {
  return [
    {
      id: 1,
      fullName: 'Jessica Davis',
      username: 'jessicadavis',
      title: 'Software Engineer',
      roles: ['Administrator', 'Editor', 'Viewer'],
    },
    {
      id: 2,
      fullName: 'Mike Moore',
      username: 'mikemoore',
      title: 'Project Manager',
      roles: ['Manager', 'Administrator'],
    },
    {
      id: 3,
      fullName: 'John Miller',
      username: 'johnmiller',
      title: 'Data Scientist',
      roles: ['Viewer', 'Administrator'],
    },
    {
      id: 4,
      fullName: 'Sarah Miller',
      username: 'sarahmiller',
      title: 'Data Scientist',
      roles: ['Manager', 'Administrator', 'Editor'],
    },
    {
      id: 5,
      fullName: 'Tom Johnson',
      username: 'tomjohnson',
      title: 'Product Manager',
      roles: ['Administrator'],
    },
    {
      id: 6,
      fullName: 'Mike Davis',
      username: 'mikedavis',
      title: 'Product Manager',
      roles: ['Viewer', 'Manager'],
    },
    {
      id: 7,
      fullName: 'David Wilson',
      username: 'davidwilson',
      title: 'UI/UX Designer',
      roles: ['Editor'],
    },
    {
      id: 8,
      fullName: 'Chris Smith',
      username: 'chrissmith',
      title: 'Data Scientist',
      roles: ['Manager'],
    },
    {
      id: 9,
      fullName: 'Jane Moore',
      username: 'janemoore',
      title: 'Software Engineer',
      roles: ['Editor', 'Administrator', 'Manager'],
    },
    {
      id: 10,
      fullName: 'Jane Brown',
      username: 'janebrown',
      title: 'Project Manager',
      roles: ['Administrator'],
    },
    {
      id: 11,
      fullName: 'Emily Wilson',
      username: 'emilywilson',
      title: 'Software Engineer',
      roles: ['Viewer', 'Administrator'],
    },
    {
      id: 12,
      fullName: 'Jessica Moore',
      username: 'jessicamoore',
      title: 'Project Manager',
      roles: ['Editor'],
    },
    {
      id: 13,
      fullName: 'David Miller',
      username: 'davidmiller',
      title: 'UI/UX Designer',
      roles: ['Viewer'],
    },
    {
      id: 14,
      fullName: 'Tom Williams',
      username: 'tomwilliams',
      title: 'UI/UX Designer',
      roles: ['Manager', 'Administrator'],
    },
    {
      id: 15,
      fullName: 'Emily Williams',
      username: 'emilywilliams',
      title: 'UI/UX Designer',
      roles: ['Editor'],
    },
    {
      id: 16,
      fullName: 'Jane Johnson',
      username: 'janejohnson',
      title: 'Project Manager',
      roles: ['Editor', 'Manager', 'Viewer'],
    },
    {
      id: 17,
      fullName: 'John Wilson',
      username: 'johnwilson',
      title: 'Data Scientist',
      roles: ['Administrator', 'Viewer'],
    },
    {
      id: 18,
      fullName: 'Emily Williams',
      username: 'emilywilliams',
      title: 'Product Manager',
      roles: ['Editor', 'Viewer', 'Manager'],
    },
    {
      id: 19,
      fullName: 'Emily Johnson',
      username: 'emilyjohnson',
      title: 'Project Manager',
      roles: ['Administrator', 'Manager', 'Editor'],
    },
    {
      id: 20,
      fullName: 'David Johnson',
      username: 'davidjohnson',
      title: 'Product Manager',
      roles: ['Viewer'],
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
