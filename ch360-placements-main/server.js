import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`\n=== ${req.method} ${req.path} ===`);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// JWT Secret (in production, use environment variable)
const JWT_SECRET = 'your-secret-key-change-in-production';

// Mock user data - Placement Staff and Students
const mockUsers = [
  // Placement Staff Users
  {
    id: 1,
    email: 'placement@mits.ac.in',
    username: 'placement_admin',
    password: 'Mits@1234',
    first_name: 'Placement',
    last_name: 'Admin',
    is_active: true,
    user_type: 'placement',
    groups: ['placement'],
    user_permissions: [
      'auth.view_user',
      'companies.view_company',
      'companies.add_company',
      'companies.change_company',
      'companies.delete_company',
      'jobs.view_job',
      'jobs.add_job',
      'jobs.change_job',
      'jobs.delete_job',
      'internships.view_internship',
      'internships.add_internship',
      'internships.change_internship',
      'internships.delete_internship',
      'applications.view_application',
      'applications.change_application',
      'applications.delete_application'
    ]
  },
  {
    id: 2,
    email: 'mrvidhyasree@mits.ac.in',
    username: 'mrvidhyasree',
    password: 'password123',
    first_name: 'Vidhya',
    last_name: 'Sree',
    is_active: true,
    user_type: 'placement',
    groups: ['placement'],
    user_permissions: [
      'auth.view_user',
      'companies.view_company',
      'jobs.view_job',
      'internships.view_internship',
      'applications.view_application',
      'applications.change_application'
    ]
  },
  // Student Users
  {
    id: 3,
    email: 'john.doe@student.mits.ac.in',
    username: 'john_doe',
    password: 'student123',
    first_name: 'John',
    last_name: 'Doe',
    is_active: true,
    user_type: 'student',
    groups: ['student'],
    student_id: 'MIT2024001',
    course: 'Computer Science',
    year: 'Final Year',
    cgpa: 8.5,
    user_permissions: [
      'jobs.view_job',
      'internships.view_internship',
      'applications.view_own_application',
      'applications.add_application',
      'applications.change_own_application'
    ]
  },
  {
    id: 4,
    email: 'jane.smith@student.mits.ac.in',
    username: 'jane_smith',
    password: 'student123',
    first_name: 'Jane',
    last_name: 'Smith',
    is_active: true,
    user_type: 'student',
    groups: ['student'],
    student_id: 'MIT2024002',
    course: 'Electronics',
    year: 'Final Year',
    cgpa: 9.2,
    user_permissions: [
      'jobs.view_job',
      'internships.view_internship',
      'applications.view_own_application',
      'applications.add_application',
      'applications.change_own_application'
    ]
  },
  {
    id: 5,
    email: 'mike.johnson@student.mits.ac.in',
    username: 'mike_johnson',
    password: 'student123',
    first_name: 'Mike',
    last_name: 'Johnson',
    is_active: true,
    user_type: 'student',
    groups: ['student'],
    student_id: 'MIT2024003',
    course: 'Mechanical',
    year: 'Third Year',
    cgpa: 8.8,
    user_permissions: [
      'jobs.view_job',
      'internships.view_internship',
      'applications.view_own_application',
      'applications.add_application',
      'applications.change_own_application'
    ]
  },
  {
    id: 6,
    email: 'sarah.wilson@student.mits.ac.in',
    username: 'sarah_wilson',
    password: 'student123',
    first_name: 'Sarah',
    last_name: 'Wilson',
    is_active: true,
    user_type: 'student',
    groups: ['student'],
    student_id: 'MIT2024004',
    course: 'Information Technology',
    year: 'Final Year',
    cgpa: 9.0,
    user_permissions: [
      'jobs.view_job',
      'internships.view_internship',
      'applications.view_own_application',
      'applications.add_application',
      'applications.change_own_application'
    ]
  },
  {
    id: 7,
    email: 'david.brown@student.mits.ac.in',
    username: 'david_brown',
    password: 'student123',
    first_name: 'David',
    last_name: 'Brown',
    is_active: true,
    user_type: 'student',
    groups: ['student'],
    student_id: 'MIT2024005',
    course: 'Civil',
    year: 'Final Year',
    cgpa: 7.8,
    user_permissions: [
      'jobs.view_job',
      'internships.view_internship',
      'applications.view_own_application',
      'applications.add_application',
      'applications.change_own_application'
    ]
  }
];

// Helper function to generate JWT tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { 
      user_id: user.id, 
      email: user.email,
      username: user.username,
      user_type: user.user_type,
      groups: user.groups,
      permissions: user.user_permissions,
      student_id: user.student_id || null,
      course: user.course || null,
      year: user.year || null,
      cgpa: user.cgpa || null
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { 
      user_id: user.id,
      user_type: user.user_type
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  return { access: accessToken, refresh: refreshToken };
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend server is running',
    timestamp: new Date().toISOString()
  });
});

// Authentication endpoints
app.post('/api/auth/token/', (req, res) => {
  const { email, username, password } = req.body;
  
  console.log('=== LOGIN REQUEST ===');
  console.log('Full request body:', JSON.stringify(req.body, null, 2));
  console.log('Headers:', req.headers);
  console.log('Login attempt:', { email, username, hasPassword: !!password });
  
  // Find user by email or username
  const user = mockUsers.find(u => 
    (email && u.email === email) || (username && u.username === username)
  );
  
  if (!user || user.password !== password) {
    console.log('Invalid credentials for:', email || username);
    return res.status(401).json({
      detail: 'Invalid credentials'
    });
  }
  
  if (!user.is_active) {
    console.log('Inactive account:', user.email);
    return res.status(401).json({
      detail: 'Account is inactive'
    });
  }
  
  // Check if user has valid access (placement staff or student)
  if (!user.groups.includes('placement') && !user.groups.includes('student')) {
    console.log('Access denied - invalid user group:', user.email, user.groups);
    return res.status(403).json({
      detail: 'Access denied. User must be placement staff or student.'
    });
  }
  
  const tokens = generateTokens(user);
  console.log('Login successful for:', user.email, 'Type:', user.user_type);
  res.json(tokens);
});

// Additional login endpoint for compatibility
app.post('/api/login/', (req, res) => {
  // Redirect to the main token endpoint
  req.url = '/api/auth/token/';
  app._router.handle(req, res);
});

// Token refresh endpoint
app.post('/api/auth/token/refresh/', (req, res) => {
  const { refresh } = req.body;
  
  try {
    const decoded = jwt.verify(refresh, JWT_SECRET);
    const user = mockUsers.find(u => u.id === decoded.user_id);
    
    if (!user || !user.is_active) {
      return res.status(401).json({
        detail: 'Invalid refresh token'
      });
    }
    
    const tokens = generateTokens(user);
    res.json(tokens);
  } catch (error) {
    res.status(401).json({
      detail: 'Invalid refresh token'
    });
  }
});

// User profile endpoint
app.get('/api/auth/user/', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      detail: 'Authentication credentials were not provided.'
    });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = mockUsers.find(u => u.id === decoded.user_id);
    
    if (!user || !user.is_active) {
      return res.status(401).json({
        detail: 'Invalid token'
      });
    }
    
    // Return user profile without password, with additional info based on user type
    const { password, ...userProfile } = user;
    
    // Add login timestamp
    userProfile.last_login = new Date().toISOString();
    
    // Add user type specific information
    if (user.user_type === 'student') {
      userProfile.student_info = {
        student_id: user.student_id,
        course: user.course,
        year: user.year,
        cgpa: user.cgpa
      };
    } else if (user.user_type === 'placement') {
      userProfile.placement_info = {
        role: user.groups.includes('placement') ? 'Placement Staff' : 'Admin',
        permissions: user.user_permissions
      };
    }
    
    res.json(userProfile);
  } catch (error) {
    res.status(401).json({
      detail: 'Invalid token'
    });
  }
});

// Session tracking endpoint
app.post('/api/auth/session/', (req, res) => {
  // Log session details (in production, store in database)
  console.log('Session details received:', req.body);
  res.json({ message: 'Session details recorded' });
});

// Companies API endpoints
app.get('/api/v1/placements/api/companies', (req, res) => {
  res.json([
    {
      id: 1,
      name: "TechCorp Solutions",
      industry: "Technology",
      location: "Bangalore, India",
      size: "500-1000",
      website: "https://techcorp.com",
      phone: "+91-80-1234-5678",
      email: "hr@techcorp.com",
      status: "active",
      jobsPosted: 15,
      lastActive: "2 days ago",
      description: "Leading technology solutions provider specializing in enterprise software development.",
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-15T10:00:00Z"
    },
    {
      id: 2,
      name: "InnovateTech Systems",
      industry: "Software Development",
      location: "Mumbai, India",
      size: "100-500",
      website: "https://innovatetech.com",
      phone: "+91-22-9876-5432",
      email: "careers@innovatetech.com",
      status: "active",
      jobsPosted: 8,
      lastActive: "1 week ago",
      description: "Innovative software development company focused on cutting-edge technologies.",
      created_at: "2024-01-20T14:30:00Z",
      updated_at: "2024-01-20T14:30:00Z"
    },
    {
      id: 3,
      name: "DataFlow Analytics",
      industry: "Data Science",
      location: "Hyderabad, India",
      size: "50-100",
      website: "https://dataflow.com",
      phone: "+91-40-5555-1234",
      email: "hr@dataflow.com",
      status: "pending",
      jobsPosted: 3,
      lastActive: "3 weeks ago",
      description: "Data analytics and machine learning solutions for businesses.",
      created_at: "2024-01-25T09:15:00Z",
      updated_at: "2024-01-25T09:15:00Z"
    },
    {
      id: 4,
      name: "CloudTech Solutions",
      industry: "Cloud Computing",
      location: "Pune, India",
      size: "1000+",
      website: "https://cloudtech.com",
      phone: "+91-20-7777-8888",
      email: "recruitment@cloudtech.com",
      status: "active",
      jobsPosted: 25,
      lastActive: "1 day ago",
      description: "Cloud infrastructure and DevOps solutions provider.",
      created_at: "2024-01-28T16:20:00Z",
      updated_at: "2024-01-28T16:20:00Z"
    },
    {
      id: 5,
      name: "GreenEnergy Corp",
      industry: "Renewable Energy",
      location: "Chennai, India",
      size: "500-1000",
      website: "https://greenenergy.com",
      phone: "+91-44-9999-0000",
      email: "jobs@greenenergy.com",
      status: "active",
      jobsPosted: 12,
      lastActive: "4 days ago",
      description: "Sustainable energy solutions and green technology innovations.",
      created_at: "2024-01-30T12:45:00Z",
      updated_at: "2024-01-30T12:45:00Z"
    },
    {
      id: 6,
      name: "FinTech Innovations",
      industry: "Financial Technology",
      location: "Delhi, India",
      size: "100-500",
      website: "https://fintechinnovations.com",
      phone: "+91-11-2222-3333",
      email: "hr@fintechinnovations.com",
      status: "active",
      jobsPosted: 7,
      lastActive: "3 days ago",
      description: "Revolutionary fintech solutions for modern banking and payments.",
      created_at: "2024-02-01T08:30:00Z",
      updated_at: "2024-02-01T08:30:00Z"
    },
    {
      id: 7,
      name: "HealthTech Solutions",
      industry: "Healthcare Technology",
      location: "Kolkata, India",
      size: "50-100",
      website: "https://healthtechsolutions.com",
      phone: "+91-33-4444-5555",
      email: "careers@healthtechsolutions.com",
      status: "pending",
      jobsPosted: 2,
      lastActive: "2 weeks ago",
      description: "Digital health solutions and medical technology innovations.",
      created_at: "2024-02-03T11:20:00Z",
      updated_at: "2024-02-03T11:20:00Z"
    },
    {
      id: 8,
      name: "EduTech Platforms",
      industry: "Education Technology",
      location: "Ahmedabad, India",
      size: "100-500",
      website: "https://edutechplatforms.com",
      phone: "+91-79-6666-7777",
      email: "jobs@edutechplatforms.com",
      status: "active",
      jobsPosted: 9,
      lastActive: "5 days ago",
      description: "Innovative educational technology platforms and learning solutions.",
      created_at: "2024-02-05T14:10:00Z",
      updated_at: "2024-02-05T14:10:00Z"
    }
  ]);
});

// Get company by ID
app.get('/api/v1/placements/api/companies/:id', (req, res) => {
  const { id } = req.params;
  const companyId = parseInt(id);
  
  // Mock company data - in real app, fetch from database
  const companies = [
    {
      id: 1,
      name: "TechCorp Solutions",
      industry: "Technology",
      location: "Bangalore, India",
      size: "500-1000",
      website: "https://techcorp.com",
      phone: "+91-80-1234-5678",
      email: "hr@techcorp.com",
      status: "active",
      jobsPosted: 15,
      lastActive: "2 days ago",
      description: "Leading technology solutions provider specializing in enterprise software development.",
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-15T10:00:00Z"
    }
  ];
  
  const company = companies.find(c => c.id === companyId);
  
  if (!company) {
    return res.status(404).json({
      detail: 'Company not found'
    });
  }
  
  res.json(company);
});

// Create new company
app.post('/api/v1/placements/api/companies', (req, res) => {
  const companyData = req.body;
  
  console.log('Creating new company:', companyData);
  
  // In a real application, you would save to database here
  const newCompany = {
    id: Date.now(), // Simple ID generation
    ...companyData,
    status: 'pending',
    jobsPosted: 0,
    lastActive: 'Just now',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  res.status(201).json(newCompany);
});

// Update company
app.patch('/api/v1/placements/api/companies/:id', (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  console.log(`Updating company ${id}:`, updateData);
  
  // In a real application, you would update the database here
  const updatedCompany = {
    id: parseInt(id),
    ...updateData,
    updated_at: new Date().toISOString()
  };
  
  res.json(updatedCompany);
});

// Delete company
app.delete('/api/v1/placements/api/companies/:id', (req, res) => {
  const { id } = req.params;
  
  console.log(`Deleting company ${id}`);
  
  // In a real application, you would delete from database here
  res.status(204).send();
});

// Legacy endpoint for backward compatibility
app.get('/api/companies/', (req, res) => {
  // Redirect to the new endpoint
  req.url = '/api/v1/placements/api/companies';
  app._router.handle(req, res);
});

app.get('/api/jobs/', (req, res) => {
  res.json([
    {
      id: 1,
      title: 'Software Engineer',
      company: 'Tech Corp',
      location: 'Remote',
      salary: '₹8-12 LPA',
      description: 'Full-stack development role',
      requirements: ['React', 'Node.js', 'TypeScript'],
      created_at: '2024-01-15T10:00:00Z'
    }
  ]);
});

app.get('/api/internships/', (req, res) => {
  res.json([
    {
      id: 1,
      title: 'Frontend Development Intern',
      company: 'Tech Corp',
      duration: '3 months',
      stipend: '₹15,000/month',
      description: 'Learn React and modern frontend development',
      requirements: ['HTML', 'CSS', 'JavaScript'],
      created_at: '2024-01-15T10:00:00Z'
    }
  ]);
});

// Applications endpoint
app.get('/api/v1/placements/api/applications', (req, res) => {
  res.json([
    {
      id: 1,
      student_name: 'John Doe',
      student_email: 'john.doe@mits.ac.in',
      student_phone: '+91 98765 43210',
      student_course: 'Computer Science',
      student_year: 'Final Year',
      student_cgpa: 8.5,
      company_name: 'Tech Corp',
      job_title: 'Software Engineer',
      job_type: 'full-time',
      application_date: '2024-01-15T10:00:00Z',
      status: 'pending',
      resume_url: '/resumes/john_doe_resume.pdf',
      cover_letter: 'I am very interested in this position...',
      notes: 'Strong technical background',
      interview_date: '2024-01-20T10:00:00Z',
      interview_feedback: 'Good technical skills'
    },
    {
      id: 2,
      student_name: 'Jane Smith',
      student_email: 'jane.smith@mits.ac.in',
      student_phone: '+91 98765 43211',
      student_course: 'Finance',
      student_year: 'Final Year',
      student_cgpa: 9.2,
      company_name: 'Finance Inc',
      job_title: 'Financial Analyst',
      job_type: 'full-time',
      application_date: '2024-01-20T14:30:00Z',
      status: 'shortlisted',
      resume_url: '/resumes/jane_smith_resume.pdf',
      cover_letter: 'I have a strong background in finance...',
      notes: 'Excellent academic record',
      interview_date: '2024-01-25T14:00:00Z',
      interview_feedback: 'Very promising candidate'
    },
    {
      id: 3,
      student_name: 'Mike Johnson',
      student_email: 'mike.johnson@mits.ac.in',
      student_phone: '+91 98765 43212',
      student_course: 'Computer Science',
      student_year: 'Third Year',
      student_cgpa: 8.8,
      company_name: 'Tech Corp',
      job_title: 'Frontend Development Intern',
      job_type: 'internship',
      application_date: '2024-01-25T09:15:00Z',
      status: 'under_review',
      resume_url: '/resumes/mike_johnson_resume.pdf',
      cover_letter: 'I am passionate about frontend development...',
      notes: 'Good portfolio projects',
      interview_date: '2024-01-30T11:00:00Z',
      interview_feedback: 'Pending'
    },
    {
      id: 4,
      student_name: 'Sarah Wilson',
      student_email: 'sarah.wilson@mits.ac.in',
      student_phone: '+91 98765 43213',
      student_course: 'Electronics',
      student_year: 'Final Year',
      student_cgpa: 8.9,
      company_name: 'Tech Corp',
      job_title: 'Hardware Engineer',
      job_type: 'full-time',
      application_date: '2024-01-28T16:20:00Z',
      status: 'selected',
      resume_url: '/resumes/sarah_wilson_resume.pdf',
      cover_letter: 'I have extensive experience in hardware design...',
      notes: 'Outstanding candidate',
      interview_date: '2024-02-01T10:00:00Z',
      interview_feedback: 'Excellent technical knowledge'
    },
    {
      id: 5,
      student_name: 'David Brown',
      student_email: 'david.brown@mits.ac.in',
      student_phone: '+91 98765 43214',
      student_course: 'Mechanical',
      student_year: 'Final Year',
      student_cgpa: 7.8,
      company_name: 'Manufacturing Co',
      job_title: 'Design Engineer',
      job_type: 'full-time',
      application_date: '2024-01-30T12:45:00Z',
      status: 'rejected',
      resume_url: '/resumes/david_brown_resume.pdf',
      cover_letter: 'I am interested in mechanical design...',
      notes: 'Not meeting requirements',
      interview_date: '2024-02-05T14:00:00Z',
      interview_feedback: 'Lacks required skills'
    }
  ]);
});

// Alternative applications endpoint for different API paths
app.get('/api/applications/', (req, res) => {
  // Redirect to the main applications endpoint
  req.url = '/api/v1/placements/api/applications';
  app._router.handle(req, res);
});

// Update application status endpoint
app.patch('/api/v1/placements/api/applications/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  console.log(`Updating application ${id} status to: ${status}`);
  
  // In a real application, you would update the database here
  // For now, we'll just return a success response
  res.json({
    id: parseInt(id),
    status: status,
    message: 'Application status updated successfully'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    detail: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    detail: 'Not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth/token/`);
});

