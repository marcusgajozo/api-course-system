import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutoMigration1779428421161 implements MigrationInterface {
  name = 'AutoMigration1779428421161';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "turmas" SET "updated_at" = "created_at" WHERE "updated_at" IS NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "turmas" ALTER COLUMN "updated_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "turmas" ALTER COLUMN "updated_at" SET DEFAULT now()`,
    );

    await queryRunner.query(
      `UPDATE "cursos" SET "updated_at" = "created_at" WHERE "updated_at" IS NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "cursos" ALTER COLUMN "updated_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "cursos" ALTER COLUMN "updated_at" SET DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cursos" ALTER COLUMN "updated_at" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "cursos" ALTER COLUMN "updated_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "turmas" ALTER COLUMN "updated_at" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "turmas" ALTER COLUMN "updated_at" DROP NOT NULL`,
    );
  }
}
