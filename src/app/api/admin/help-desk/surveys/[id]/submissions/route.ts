import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { requireAuth } from '@/lib/services/loaders.middleware';
import { verifyUserHasPermission } from '@/lib/helpers/server/PermissionsService';
import { getTenantIdOrNull } from '@/utils/services/server/urlService';
import SurveyUtils from '@/modules/surveys/utils/SurveyUtils';
import { getServerTranslations } from '@/i18n/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    await verifyUserHasPermission('admin.surveys');
    
    const { id } = await params;
    const tenantId = await getTenantIdOrNull({ request, params: { id } });
    
    const item = await db.surveys.getSurveyById({ tenantId, id });
    if (!item) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      );
    }
    
    const submissions = await db.surveySubmissions.getSurveySubmissions(item.id);
    
    return NextResponse.json({
      item: SurveyUtils.surveyToDto(item),
      submissions,
    });
  } catch (error) {
    console.error('Error fetching survey submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch survey submissions' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    await verifyUserHasPermission('admin.surveys');
    
    const { t } = await getServerTranslations();
    const body = await request.json();
    const action = body.action;
    
    if (action === 'delete') {
      const submissionId = body.id;
      if (!submissionId) {
        return NextResponse.json(
          { error: 'Submission ID is required' },
          { status: 400 }
        );
      }
      
      await db.surveySubmissions.deleteSurveySubmission(submissionId);
      return NextResponse.json({ success: t('shared.deleted') });
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error processing survey submission action:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process action' },
      { status: 500 }
    );
  }
}
