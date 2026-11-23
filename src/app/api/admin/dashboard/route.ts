import { NextRequest, NextResponse } from "next/server";
import { query, queryOne, execute } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { apiError } from "@/lib/security";

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin("dashboard.view");
    const body = await req.json();
    if (body.markAllRead) {
      await execute("UPDATE notifications SET is_read = 1 WHERE is_read = 0");
    } else if (body.notificationId) {
      await execute("UPDATE notifications SET is_read = 1 WHERE id = ?", [
        Number(body.notificationId),
      ]);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return apiError(err, "Failed to update notifications");
  }
}

export async function GET() {
  try {
    await requireAdmin("dashboard.view");

    const [
      enquiryStats,
      contactStats,
      projectStats,
      propertyStats,
      blogStats,
      enquiriesByStatus,
      enquiriesByType,
      monthlyTrend,
      recentLeads,
      recentActivities,
      unreadNotifications,
    ] = await Promise.all([
      queryOne<{
        total: number;
        new_count: number;
        property_enquiries: number;
        converted_count: number;
      }>(`
        SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN status = 'New' THEN 1 ELSE 0 END) AS new_count,
          SUM(CASE WHEN enquiry_type IN ('property', 'project', 'site_visit') THEN 1 ELSE 0 END) AS property_enquiries,
          SUM(CASE WHEN status = 'Converted' THEN 1 ELSE 0 END) AS converted_count
        FROM enquiries
      `),
      queryOne<{ total: number; new_count: number }>(`
        SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN status = 'New' THEN 1 ELSE 0 END) AS new_count
        FROM contact_submissions
      `),
      queryOne<{ total: number; published: number }>(`
        SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS published
        FROM projects
      `),
      queryOne<{ total: number; published: number }>(`
        SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS published
        FROM properties
      `),
      queryOne<{ total: number; published: number }>(`
        SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS published
        FROM blogs
      `),
      query<{ name: string; value: number }>(`
        SELECT status AS name, COUNT(*) AS value
        FROM enquiries
        GROUP BY status
        ORDER BY value DESC
      `),
      query<{ name: string; value: number }>(`
        SELECT COALESCE(preferred_location, enquiry_type) AS name, COUNT(*) AS value
        FROM enquiries
        GROUP BY COALESCE(preferred_location, enquiry_type)
        ORDER BY value DESC
        LIMIT 8
      `),
      query<{ month: string; enquiries: number; contacts: number }>(`
        SELECT
          m.ym AS month,
          COALESCE(e.cnt, 0) AS enquiries,
          COALESCE(c.cnt, 0) AS contacts
        FROM (
          SELECT DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL n MONTH), '%Y-%m') AS ym
          FROM (SELECT 5 AS n UNION SELECT 4 UNION SELECT 3 UNION SELECT 2 UNION SELECT 1 UNION SELECT 0) nums
        ) m
        LEFT JOIN (
          SELECT DATE_FORMAT(created_at, '%Y-%m') AS ym, COUNT(*) AS cnt
          FROM enquiries
          GROUP BY ym
        ) e ON e.ym = m.ym
        LEFT JOIN (
          SELECT DATE_FORMAT(created_at, '%Y-%m') AS ym, COUNT(*) AS cnt
          FROM contact_submissions
          GROUP BY ym
        ) c ON c.ym = m.ym
        ORDER BY m.ym ASC
      `),
      query(`
        SELECT id, name, phone, email, enquiry_type, property_interest, preferred_location, budget_range, status, created_at
        FROM enquiries
        ORDER BY created_at DESC
        LIMIT 8
      `),
      query(`
        SELECT id, admin_name, action, module, details, created_at
        FROM activity_logs
        ORDER BY created_at DESC
        LIMIT 10
      `),
      query(`
        SELECT id, title, message, type, link_url, is_read, created_at
        FROM notifications
        ORDER BY created_at DESC
        LIMIT 10
      `),
    ]);

    return NextResponse.json({
      kpis: {
        totalEnquiries: Number(enquiryStats?.total || 0),
        newEnquiries: Number(enquiryStats?.new_count || 0),
        contactRequests: Number(contactStats?.total || 0),
        newContacts: Number(contactStats?.new_count || 0),
        propertyEnquiries: Number(enquiryStats?.property_enquiries || 0),
        convertedLeads: Number(enquiryStats?.converted_count || 0),
        totalProjects: Number(projectStats?.total || 0),
        publishedProjects: Number(projectStats?.published || 0),
        totalProperties: Number(propertyStats?.total || 0),
        publishedProperties: Number(propertyStats?.published || 0),
        totalBlogs: Number(blogStats?.total || 0),
        publishedBlogs: Number(blogStats?.published || 0),
      },
      charts: {
        enquiriesByStatus: enquiriesByStatus.map((r) => ({ name: r.name, value: Number(r.value) })),
        enquiriesByLocation: enquiriesByType.map((r) => ({ name: r.name, value: Number(r.value) })),
        monthlyTrend: monthlyTrend.map((r) => ({
          month: r.month,
          enquiries: Number(r.enquiries),
          contacts: Number(r.contacts),
        })),
      },
      recentLeads,
      recentActivities,
      notifications: unreadNotifications,
    });
  } catch (err) {
    return apiError(err, "Failed to load dashboard overview");
  }
}
